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
