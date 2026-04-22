package com.edumaterials.domain

import com.edumaterials.api.dto.CompleteSessionResponse
import com.edumaterials.api.dto.StartSessionRequest
import com.edumaterials.api.dto.StartSessionResponse
import com.edumaterials.api.dto.SubmitAnswerRequest
import com.edumaterials.api.dto.SubmitAnswerResponse
import com.edumaterials.api.dto.TestSessionSummaryResponse
import com.edumaterials.config.AppProperties
import com.edumaterials.data.entity.AnswerResult
import com.edumaterials.data.entity.TestSession
import com.edumaterials.data.repository.AnswerResultRepository
import com.edumaterials.data.repository.QuestionRepository
import com.edumaterials.data.repository.TestSessionRepository
import com.edumaterials.data.repository.TopicRepository
import com.edumaterials.data.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import kotlin.math.abs

@Service
class TestSessionService(
    private val appProperties: AppProperties,
    private val topicRepository: TopicRepository,
    private val questionRepository: QuestionRepository,
    private val testSessionRepository: TestSessionRepository,
    private val answerResultRepository: AnswerResultRepository,
    private val userRepository: UserRepository,
    private val answerEvaluation: AnswerEvaluation,
    private val questionMapper: QuestionMapper,
    private val recommendationService: RecommendationService,
) {
    companion object {
        /** Сериализация параллельных POST /test-sessions для одной пары (user, topic). */
        private val START_LOCK_STRIPES = Array(64) { Any() }

        private fun startLockStripe(userId: Long, topicId: Long): Any {
            val h = (userId xor topicId).toInt()
            val idx = abs(h) % START_LOCK_STRIPES.size
            return START_LOCK_STRIPES[idx]
        }
    }

    @Transactional
    fun start(userId: Long, request: StartSessionRequest): StartSessionResponse {
        val topicId = request.topicId
        if (!topicRepository.existsById(topicId)) {
            throw IllegalArgumentException("Тема не найдена")
        }
        synchronized(startLockStripe(userId, topicId)) {
            val unfinished =
                testSessionRepository.findByUserIdAndTopicIdAndFinishedIsFalseOrderByIdDesc(userId, topicId)
            if (unfinished.isNotEmpty()) {
                val best = unfinished.maxWith(
                    compareBy(
                        { s: TestSession -> answerResultRepository.countByTestSessionId(s.id) },
                        TestSession::currentQuestionIndex,
                        TestSession::id,
                    ),
                )
                unfinished.filter { it.id != best.id }.forEach { orphan ->
                    if (answerResultRepository.countByTestSessionId(orphan.id) == 0L) {
                        testSessionRepository.delete(orphan)
                    }
                }
                return buildStartResponse(best, topicId)
            }
            val questions = questionRepository.findByTopicIdOrderByOrderIndexAsc(topicId)
            val session = testSessionRepository.save(
                TestSession(
                    userId = userId,
                    topicId = topicId,
                    startedAt = Instant.now(),
                    currentQuestionIndex = 0,
                    finished = false,
                ),
            )
            val first = questions.getOrNull(0)?.let { questionMapper.toStudent(it) }
            return StartSessionResponse(
                sessionId = session.id.toString(),
                topicId = topicId.toString(),
                question = first,
            )
        }
    }

    private fun buildStartResponse(session: TestSession, topicId: Long): StartSessionResponse {
        val questions = questionRepository.findByTopicIdOrderByOrderIndexAsc(topicId)
        val q = questions.getOrNull(session.currentQuestionIndex)?.let { questionMapper.toStudent(it) }
        return StartSessionResponse(
            sessionId = session.id.toString(),
            topicId = topicId.toString(),
            question = q,
        )
    }

    @Transactional
    fun submitAnswer(sessionId: Long, userId: Long, request: SubmitAnswerRequest): SubmitAnswerResponse {
        val session = loadOwnedSession(sessionId, userId)
        if (session.finished) {
            throw IllegalArgumentException("Сессия уже завершена")
        }
        val questions = questionRepository.findByTopicIdOrderByOrderIndexAsc(session.topicId)
        if (questions.isEmpty()) {
            throw IllegalArgumentException("В теме нет вопросов")
        }
        if (session.currentQuestionIndex >= questions.size) {
            throw IllegalArgumentException("Нет активного вопроса — завершите сессию")
        }
        val expected = questions[session.currentQuestionIndex]
        if (expected.id != request.questionId) {
            throw IllegalArgumentException("Ожидался другой вопрос")
        }
        val outcome = answerEvaluation.evaluate(expected, request.userAnswer)
        val ai = outcome.correctnessWeight
        val qid = expected.id
        val totalBefore = answerResultRepository.countByQuestionId(qid)
        val correctBefore =
            answerResultRepository.countByQuestionIdAndIsCorrect(qid, true)
        val timesBefore = answerResultRepository.findResponseTimeMsByQuestionId(qid)
        val partial = MasteryScoring.partialScore(
            question = expected,
            ai = ai,
            responseTimeMs = request.responseTimeMs,
            totalAttemptsBefore = totalBefore,
            correctAttemptsBefore = correctBefore,
            responseTimesMsBefore = timesBefore,
            defaultNormativeTimeMs = appProperties.recommendation.defaultNormativeTimeMs,
        )
        answerResultRepository.save(
            AnswerResult(
                testSessionId = session.id,
                questionId = expected.id,
                userAnswer = request.userAnswer,
                isCorrect = outcome.fullyCorrect,
                score = ai,
                responseTimeMs = request.responseTimeMs,
                partialScore = partial,
            ),
        )
        session.currentQuestionIndex += 1
        testSessionRepository.save(session)
        val next = questions.getOrNull(session.currentQuestionIndex)?.let { questionMapper.toStudent(it) }
        return SubmitAnswerResponse(nextQuestion = next)
    }

    @Transactional
    fun complete(sessionId: Long, userId: Long): CompleteSessionResponse {
        val session = loadOwnedSession(sessionId, userId)
        if (session.finished) {
            throw IllegalArgumentException("Сессия уже завершена")
        }
        val questions = questionRepository.findByTopicIdOrderByOrderIndexAsc(session.topicId)
        val answers = answerResultRepository.findByTestSessionIdOrderByIdAsc(session.id)
        if (questions.isNotEmpty() && answers.size != questions.size) {
            throw IllegalArgumentException("Ответьте на все вопросы перед завершением")
        }
        val mastery = if (answers.isEmpty()) {
            0.0
        } else {
            answers.map { it.partialScore }.average()
        }
        session.finished = true
        session.finishedAt = Instant.now()
        session.masteryScore = mastery
        testSessionRepository.save(session)
        val topic = topicRepository.findById(session.topicId).orElseThrow {
            IllegalArgumentException("Тема не найдена")
        }
        val materials = recommendationService.pickMaterials(
            session.topicId,
            mastery,
            topic.hLow,
            topic.hHigh,
        ).map { it.toResponse() }
        val label = recommendationService.masteryLabel(mastery, topic.hLow, topic.hHigh)
        return CompleteSessionResponse(
            sessionId = session.id.toString(),
            topicId = session.topicId.toString(),
            masteryScore = mastery,
            masteryLabel = label,
            recommendations = materials,
        )
    }

    /**
     * Прерывание теста: сессия закрывается без расчёта M_C (masteryScore остаётся null).
     */
    @Transactional
    fun abandon(sessionId: Long, userId: Long) {
        val session = loadOwnedSession(sessionId, userId)
        if (session.finished) {
            throw IllegalArgumentException("Сессия уже завершена")
        }
        session.finished = true
        session.finishedAt = Instant.now()
        session.masteryScore = null
        testSessionRepository.save(session)
    }

    /**
     * Закрыть все незавершённые сессии пользователя (выход из аккаунта во время теста и т.п.).
     */
    @Transactional
    fun abandonAllUnfinishedForUser(userId: Long) {
        val open = testSessionRepository.findByUserIdAndFinishedIsFalseOrderByIdDesc(userId)
        if (open.isEmpty()) return
        val now = Instant.now()
        for (s in open) {
            s.finished = true
            s.finishedAt = now
            s.masteryScore = null
            testSessionRepository.save(s)
        }
    }

    @Transactional(readOnly = true)
    fun listMySessions(userId: Long): List<TestSessionSummaryResponse> {
        val sessions = testSessionRepository.findByUserIdOrderByStartedAtDesc(userId)
        return dedupeGhostSessions(sessions).map { toSummary(it, includeUser = false) }
    }

    @Transactional(readOnly = true)
    fun listAllSessionsForTeacher(): List<TestSessionSummaryResponse> {
        val sessions = testSessionRepository.findAll().sortedByDescending { it.startedAt }
        return dedupeGhostSessions(sessions).map { toSummary(it, includeUser = true) }
    }

    /**
     * Убирает «призраки» и дубликаты в одну секунду:
     * — незавершённая + завершённая → оставляем завершённые;
     * — несколько незавершённых → одна с максимальным id;
     * — несколько завершённых: если есть с расчётом M_C — только они (без «брошенных» без балла);
     *   иначе одна запись с максимальным id.
     */
    private fun dedupeGhostSessions(sessions: List<TestSession>): List<TestSession> {
        val byKey = sessions.groupBy { Triple(it.userId, it.topicId, it.startedAt.epochSecond) }
        val result = mutableListOf<TestSession>()
        for (group in byKey.values) {
            val finished = group.filter { it.finished }
            val unfinished = group.filter { !it.finished }
            when {
                finished.isNotEmpty() && unfinished.isNotEmpty() -> {
                    result.addAll(finished)
                }
                unfinished.size > 1 && finished.isEmpty() -> {
                    result.add(unfinished.maxBy { it.id })
                }
                finished.size > 1 -> {
                    val scored = finished.filter { it.masteryScore != null }
                    when {
                        scored.isNotEmpty() -> result.addAll(scored)
                        else -> result.add(finished.maxBy { it.id })
                    }
                }
                else -> result.addAll(group)
            }
        }
        return result.sortedByDescending { it.startedAt }
    }

    private fun loadOwnedSession(sessionId: Long, userId: Long): TestSession {
        val session = testSessionRepository.findById(sessionId).orElseThrow {
            IllegalArgumentException("Сессия не найдена")
        }
        if (session.userId != userId) {
            throw IllegalArgumentException("Нет доступа к сессии")
        }
        return session
    }

    private fun toSummary(session: TestSession, includeUser: Boolean): TestSessionSummaryResponse {
        val topic = topicRepository.findById(session.topicId).orElse(null)
        val user = if (includeUser) userRepository.findById(session.userId).orElse(null) else null
        return TestSessionSummaryResponse(
            id = session.id.toString(),
            topicId = session.topicId.toString(),
            topicName = topic?.name ?: "",
            startedAt = session.startedAt.toString(),
            finishedAt = session.finishedAt?.toString(),
            masteryScore = session.masteryScore,
            finished = session.finished,
            userId = user?.id?.toString(),
            userName = user?.name,
        )
    }
}
