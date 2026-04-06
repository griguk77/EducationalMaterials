package com.edumaterials.api

import com.edumaterials.api.dto.MaterialCreateRequest
import com.edumaterials.api.dto.MaterialUpdateRequest
import com.edumaterials.domain.MaterialService
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
@RequestMapping("/api/topics/{topicId}/materials")
class MaterialController(
    private val materialService: MaterialService,
) {
    @GetMapping
    fun list(@PathVariable topicId: Long) = materialService.listForTopic(topicId)

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    fun create(
        @PathVariable topicId: Long,
        @Valid @RequestBody body: MaterialCreateRequest,
    ) = materialService.create(topicId, body)

    @PutMapping("/{materialId}")
    @PreAuthorize("hasRole('TEACHER')")
    fun update(
        @PathVariable topicId: Long,
        @PathVariable materialId: Long,
        @Valid @RequestBody body: MaterialUpdateRequest,
    ) = materialService.update(topicId, materialId, body)

    @DeleteMapping("/{materialId}")
    @PreAuthorize("hasRole('TEACHER')")
    fun delete(
        @PathVariable topicId: Long,
        @PathVariable materialId: Long,
    ) {
        materialService.delete(topicId, materialId)
    }
}
