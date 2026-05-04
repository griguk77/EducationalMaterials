package com.edumaterials.api.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class StartSessionRequest(
    @field:NotNull val topicId: Long,
)

data class StartSessionResponse(
    val sessionId: String,
    val topicId: String,
    val question: StudentQuestionResponse?,
)

data class SubmitAnswerRequest(
    @field:NotNull val questionId: Long,
    @field:NotBlank val userAnswer: String,
    @field:NotNull @field:Min(0) val responseTimeMs: Long,
)

data class SubmitAnswerResponse(
    val nextQuestion: StudentQuestionResponse?,
)

data class CompleteSessionResponse(
    val sessionId: String,
    val topicId: String,
    val masteryScore: Double,
    val masteryLabel: String,
    val recommendations: List<MaterialResponse>,
    val questionScores: List<QuestionScoreResponse>,
)

data class QuestionScoreResponse(
    val questionId: String,
    val questionText: String,
    /** a_i: оценка корректности ответа (0..1). */
    val ai: Double,
    /** v_i: скоростной коэффициент = min(1, T_i / t_i). */
    val vi: Double,
    /** d_i: сложность вопроса (по статистике или исходной difficulty). */
    val di: Double,
    /** t_i: фактическое время ответа пользователя (мс). */
    val responseTimeMs: Long,
    /** T_i: нормативное время (мс), использованное в расчёте v_i. */
    val normativeTimeMs: Long,
    /** q_i = (a_i + v_i + d_i) / 3 */
    val partialScore: Double,
)

data class TestSessionSummaryResponse(
    val id: String,
    val topicId: String,
    val topicName: String,
    val startedAt: String,
    val finishedAt: String?,
    val masteryScore: Double?,
    val finished: Boolean,
    val userId: String?,
    val userName: String?,
)
