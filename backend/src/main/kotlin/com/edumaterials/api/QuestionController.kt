package com.edumaterials.api

import com.edumaterials.api.dto.QuestionCreateRequest
import com.edumaterials.api.dto.QuestionUpdateRequest
import com.edumaterials.domain.QuestionService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/topics/{topicId}/questions")
class QuestionController(
    private val questionService: QuestionService,
) {
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    fun list(@PathVariable topicId: Long) = questionService.listForTopic(topicId)

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    fun create(
        @PathVariable topicId: Long,
        @Valid @RequestBody body: QuestionCreateRequest,
    ) = questionService.create(topicId, body)

    @PutMapping("/{questionId}")
    @PreAuthorize("hasRole('TEACHER')")
    fun update(
        @PathVariable topicId: Long,
        @PathVariable questionId: Long,
        @Valid @RequestBody body: QuestionUpdateRequest,
    ) = questionService.update(topicId, questionId, body)

    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasRole('TEACHER')")
    fun delete(
        @PathVariable topicId: Long,
        @PathVariable questionId: Long,
    ) {
        questionService.delete(topicId, questionId)
    }
}
