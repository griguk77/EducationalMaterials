package com.edumaterials.domain

import com.edumaterials.data.entity.AnswerType
import com.edumaterials.data.entity.Question
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component

@Component
class AnswerEvaluation(
    private val objectMapper: ObjectMapper,
) {
    fun isCorrect(question: Question, userAnswer: String): Boolean {
        val trimmed = userAnswer.trim()
        return when (question.answerType) {
            AnswerType.SINGLE -> trimmed == question.correctAnswer.trim()
            AnswerType.MULTIPLE -> {
                val correct: List<String> = objectMapper.readValue(
                    question.correctAnswer,
                    object : TypeReference<List<String>>() {},
                )
                val user: List<String> = objectMapper.readValue(
                    trimmed.ifEmpty { "[]" },
                    object : TypeReference<List<String>>() {},
                )
                correct.toSet() == user.toSet()
            }
            AnswerType.TEXT -> trimmed.equals(question.correctAnswer.trim(), ignoreCase = true)
        }
    }
}
