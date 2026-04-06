package com.edumaterials.domain

import com.edumaterials.data.entity.Question
import kotlin.math.min

/**
 * Реализация формул из НИР / DOCUMENTATION.md:
 * - d_i = 1 - C_i/N_i (по статистике ответов на вопрос; при отсутствии данных — оценка сложности из вопроса);
 * - T_i = median(t_{i,k}) по накопленным ответам; при отсутствии — normativeTimeMs или дефолт;
 * - v_i = min(1, T_i/t_i);
 * - q_i = (a_i + v_i + d_i) / 3;
 * - M_C = среднее q_i по сессии (в TestSessionService).
 */
object MasteryScoring {
    fun median(values: List<Long>): Long? {
        if (values.isEmpty()) return null
        val sorted = values.sorted()
        val mid = sorted.size / 2
        return if (sorted.size % 2 == 1) {
            sorted[mid]
        } else {
            (sorted[mid - 1] + sorted[mid]) / 2
        }
    }

    /**
     * @param totalAttemptsBefore число уже сохранённых ответов на этот вопрос (без текущего)
     * @param correctAttemptsBefore число верных среди них
     * @param responseTimesMsBefore времена ответов (мс) по этому вопросу до текущего ответа
     */
    fun partialScore(
        question: Question,
        ai: Double,
        responseTimeMs: Long,
        totalAttemptsBefore: Long,
        correctAttemptsBefore: Long,
        responseTimesMsBefore: List<Long>,
        defaultNormativeTimeMs: Long,
    ): Double {
        val ti = responseTimeMs.coerceAtLeast(1L)

        val di = if (totalAttemptsBefore > 0) {
            val ratio = correctAttemptsBefore.toDouble() / totalAttemptsBefore.toDouble()
            (1.0 - ratio).coerceIn(0.0, 1.0)
        } else {
            question.difficulty.coerceIn(0.0, 1.0)
        }

        val tiNormative = median(responseTimesMsBefore)
            ?: (question.normativeTimeMs ?: defaultNormativeTimeMs).coerceAtLeast(1L)

        val vi = min(1.0, tiNormative.toDouble() / ti.toDouble())

        return (ai + vi + di) / 3.0
    }
}
