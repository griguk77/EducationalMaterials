package com.edumaterials.api

import com.edumaterials.api.dto.TopicCreateRequest
import com.edumaterials.api.dto.TopicUpdateRequest
import com.edumaterials.domain.TopicService
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
@RequestMapping("/api/topics")
class TopicController(
    private val topicService: TopicService,
) {
    @GetMapping
    fun list() = topicService.list()

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long) = topicService.get(id)

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    fun create(@Valid @RequestBody body: TopicCreateRequest) = topicService.create(body)

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody body: TopicUpdateRequest,
    ) = topicService.update(id, body)

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    fun delete(@PathVariable id: Long) {
        topicService.delete(id)
    }
}
