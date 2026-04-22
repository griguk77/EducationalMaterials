package com.edumaterials.domain

import com.edumaterials.api.dto.QuestionOptionDto
import com.edumaterials.data.entity.AnswerType
import com.edumaterials.data.entity.Question
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component

/**
 * Результат проверки ответа: полное совпадение (для статистики и флага isCorrect)
 * и вес a_i ∈ [0, 1] для формулы q_i (для MULTIPLE допускается частичный вес).
 */
data class AnswerOutcome(
    val fullyCorrect: Boolean,
    val correctnessWeight: Double,
)

@Component
class AnswerEvaluation(
    private val objectMapper: ObjectMapper,
) {
    fun evaluate(question: Question, userAnswer: String): AnswerOutcome {
        val trimmed = userAnswer.trim()
        return when (question.answerType) {
            AnswerType.SINGLE -> {
                val ok = trimmed == question.correctAnswer.trim()
                AnswerOutcome(ok, if (ok) 1.0 else 0.0)
            }
            AnswerType.TEXT -> {
                val ok = trimmed.equals(question.correctAnswer.trim(), ignoreCase = true)
                AnswerOutcome(ok, if (ok) 1.0 else 0.0)
            }
            AnswerType.MULTIPLE -> evaluateMultiple(question, trimmed)
        }
    }

    /**
     * MULTIPLE:
     * - Полностью верно: все верные отмечены, лишних нет → вес 1.
     * - Частично: recall = tp/k и штраф за ложные отметки среди неверных вариантов на экране.
     * - Минимум 0; если выбраны ровно все варианты, при этом не все они верны → 0 (стратегия «отметить всё»).
     * - Если нет options_json, остаётся только бинарная оценка 0/1.
     */
    private fun evaluateMultiple(question: Question, trimmed: String): AnswerOutcome {
        val correct: Set<String> = objectMapper.readValue(
            question.correctAnswer,
            object : TypeReference<List<String>>() {},
        ).toSet()
        val user: Set<String> = objectMapper.readValue(
            trimmed.ifEmpty { "[]" },
            object : TypeReference<List<String>>() {},
        ).toSet()
        val fully = correct == user

        val allIds = optionIdsFromQuestion(question)
        val n = allIds.size
        val k = correct.size

        if (k == 0) {
            return AnswerOutcome(fully, 0.0)
        }

        if (n == 0) {
            val w = if (fully) 1.0 else 0.0
            return AnswerOutcome(fully, w)
        }

        // Выбраны все варианты с экрана, но верными являются не все → 0
        if (user == allIds && k < n) {
            return AnswerOutcome(fully, 0.0)
        }

        val tp = user.intersect(correct).size
        val fp = (user - correct).size
        val recall = tp.toDouble() / k.toDouble()
        val wrongOnScreen = n - k
        val precisionFactor = if (wrongOnScreen > 0) {
            (1.0 - fp.toDouble() / wrongOnScreen.toDouble()).coerceIn(0.0, 1.0)
        } else {
            1.0
        }
        val weight = (recall * precisionFactor).coerceIn(0.0, 1.0)
        return AnswerOutcome(fully, weight)
    }

    private fun optionIdsFromQuestion(question: Question): Set<String> {
        val json = question.optionsJson ?: return emptySet()
        if (json.isBlank()) return emptySet()
        val opts: List<QuestionOptionDto> = objectMapper.readValue(
            json,
            object : TypeReference<List<QuestionOptionDto>>() {},
        )
        return opts.map { it.id }.toSet()
    }
}
