package com.edumaterials.data.repository

import com.edumaterials.data.entity.AnswerResult
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface AnswerResultRepository : JpaRepository<AnswerResult, Long> {
    fun findByTestSessionIdOrderByIdAsc(testSessionId: Long): List<AnswerResult>

    fun countByTestSessionId(testSessionId: Long): Long

    fun countByQuestionId(questionId: Long): Long

    fun countByQuestionIdAndIsCorrect(questionId: Long, isCorrect: Boolean): Long

    @Query("SELECT r.responseTimeMs FROM AnswerResult r WHERE r.questionId = :questionId")
    fun findResponseTimeMsByQuestionId(@Param("questionId") questionId: Long): List<Long>
}
