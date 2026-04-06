package com.edumaterials.api.dto

import com.edumaterials.data.entity.AnswerType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class QuestionOptionDto(
    val id: String,
    val text: String,
)

data class QuestionTeacherResponse(
    val id: String,
    val topicId: String,
    val text: String,
    val answerType: AnswerType,
    val options: List<QuestionOptionDto>?,
    val correctAnswer: String,
    val difficulty: Double,
    val normativeTimeMs: Long?,
    val orderIndex: Int,
)

data class StudentQuestionResponse(
    val id: String,
    val text: String,
    val answerType: AnswerType,
    val options: List<QuestionOptionDto>?,
    val normativeTimeMs: Long?,
)

data class QuestionCreateRequest(
    @field:NotBlank @field:Size(max = 4000) val text: String,
    val optionsJson: String?,
    @field:NotBlank val correctAnswer: String,
    @field:NotNull val difficulty: Double,
    @field:NotNull val answerType: AnswerType,
    val normativeTimeMs: Long?,
    val orderIndex: Int?,
)

data class QuestionUpdateRequest(
    @field:NotBlank @field:Size(max = 4000) val text: String,
    val optionsJson: String?,
    @field:NotBlank val correctAnswer: String,
    @field:NotNull val difficulty: Double,
    @field:NotNull val answerType: AnswerType,
    val normativeTimeMs: Long?,
    val orderIndex: Int?,
)
