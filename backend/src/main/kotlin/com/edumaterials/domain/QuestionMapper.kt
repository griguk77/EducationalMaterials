package com.edumaterials.domain

import com.edumaterials.api.dto.QuestionOptionDto
import com.edumaterials.api.dto.QuestionTeacherResponse
import com.edumaterials.api.dto.StudentQuestionResponse
import com.edumaterials.data.entity.Question
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component

@Component
class QuestionMapper(
    private val objectMapper: ObjectMapper,
) {
    fun toStudent(q: Question): StudentQuestionResponse =
        StudentQuestionResponse(
            id = q.id.toString(),
            text = q.text,
            answerType = q.answerType,
            options = parseOptions(q.optionsJson),
            normativeTimeMs = q.normativeTimeMs,
        )

    fun toTeacher(q: Question): QuestionTeacherResponse =
        QuestionTeacherResponse(
            id = q.id.toString(),
            topicId = q.topicId.toString(),
            text = q.text,
            answerType = q.answerType,
            options = parseOptions(q.optionsJson),
            correctAnswer = q.correctAnswer,
            difficulty = q.difficulty,
            normativeTimeMs = q.normativeTimeMs,
            orderIndex = q.orderIndex,
        )

    private fun parseOptions(json: String?): List<QuestionOptionDto>? {
        if (json.isNullOrBlank()) return null
        return objectMapper.readValue(
            json,
            object : TypeReference<List<QuestionOptionDto>>() {},
        )
    }
}
