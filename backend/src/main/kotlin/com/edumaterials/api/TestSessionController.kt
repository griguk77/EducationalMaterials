package com.edumaterials.api

import com.edumaterials.api.dto.StartSessionRequest
import com.edumaterials.api.dto.SubmitAnswerRequest
import com.edumaterials.domain.TestSessionService
import com.edumaterials.security.SecurityUtils
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/test-sessions")
class TestSessionController(
    private val testSessionService: TestSessionService,
) {
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    fun start(@Valid @RequestBody body: StartSessionRequest) =
        testSessionService.start(SecurityUtils.currentUserId(), body)

    @PostMapping("/{sessionId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    fun submitAnswer(
        @PathVariable sessionId: Long,
        @Valid @RequestBody body: SubmitAnswerRequest,
    ) = testSessionService.submitAnswer(sessionId, SecurityUtils.currentUserId(), body)

    @PostMapping("/{sessionId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    fun complete(@PathVariable sessionId: Long) =
        testSessionService.complete(sessionId, SecurityUtils.currentUserId())

    @PostMapping("/{sessionId}/abandon")
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun abandon(@PathVariable sessionId: Long) {
        testSessionService.abandon(sessionId, SecurityUtils.currentUserId())
    }
}
