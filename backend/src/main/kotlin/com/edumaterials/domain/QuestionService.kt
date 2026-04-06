package com.edumaterials.domain

import com.edumaterials.api.dto.QuestionCreateRequest
import com.edumaterials.api.dto.QuestionTeacherResponse
import com.edumaterials.api.dto.QuestionUpdateRequest
import com.edumaterials.data.entity.Question
import com.edumaterials.data.repository.QuestionRepository
import com.edumaterials.data.repository.TopicRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class QuestionService(
    private val topicRepository: TopicRepository,
    private val questionRepository: QuestionRepository,
    private val questionMapper: QuestionMapper,
) {
    @Transactional(readOnly = true)
    fun listForTopic(topicId: Long): List<QuestionTeacherResponse> {
        ensureTopic(topicId)
        return questionRepository.findByTopicIdOrderByOrderIndexAsc(topicId)
            .map { questionMapper.toTeacher(it) }
    }

    @Transactional
    fun create(topicId: Long, request: QuestionCreateRequest): QuestionTeacherResponse {
        ensureTopic(topicId)
        val nextOrder = request.orderIndex
            ?: (questionRepository.findByTopicIdOrderByOrderIndexAsc(topicId).maxOfOrNull { it.orderIndex }?.plus(1)
                ?: 0)
        val q = Question(
            topicId = topicId,
            text = request.text.trim(),
            optionsJson = request.optionsJson?.trim(),
            correctAnswer = request.correctAnswer.trim(),
            difficulty = request.difficulty.coerceIn(0.0, 1.0),
            answerType = request.answerType,
            normativeTimeMs = request.normativeTimeMs,
            orderIndex = nextOrder,
        )
        return questionMapper.toTeacher(questionRepository.save(q))
    }

    @Transactional
    fun update(topicId: Long, questionId: Long, request: QuestionUpdateRequest): QuestionTeacherResponse {
        val q = questionRepository.findById(questionId).orElseThrow {
            IllegalArgumentException("Вопрос не найден")
        }
        if (q.topicId != topicId) {
            throw IllegalArgumentException("Вопрос не относится к теме")
        }
        q.text = request.text.trim()
        q.optionsJson = request.optionsJson?.trim()
        q.correctAnswer = request.correctAnswer.trim()
        q.difficulty = request.difficulty.coerceIn(0.0, 1.0)
        q.answerType = request.answerType
        q.normativeTimeMs = request.normativeTimeMs
        request.orderIndex?.let { q.orderIndex = it }
        return questionMapper.toTeacher(questionRepository.save(q))
    }

    @Transactional
    fun delete(topicId: Long, questionId: Long) {
        val q = questionRepository.findById(questionId).orElseThrow {
            IllegalArgumentException("Вопрос не найден")
        }
        if (q.topicId != topicId) {
            throw IllegalArgumentException("Вопрос не относится к теме")
        }
        questionRepository.delete(q)
    }

    private fun ensureTopic(topicId: Long) {
        if (!topicRepository.existsById(topicId)) {
            throw IllegalArgumentException("Тема не найдена")
        }
    }
}
