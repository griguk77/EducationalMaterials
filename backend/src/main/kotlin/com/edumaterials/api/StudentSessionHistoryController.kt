package com.edumaterials.api

import com.edumaterials.domain.TestSessionService
import com.edumaterials.security.SecurityUtils
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/student/sessions")
@PreAuthorize("hasRole('STUDENT')")
class StudentSessionHistoryController(
    private val testSessionService: TestSessionService,
) {
    @GetMapping
    fun list() = testSessionService.listMySessions(SecurityUtils.currentUserId())

    @PostMapping("/abandon-all-unfinished")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun abandonAllUnfinished() {
        testSessionService.abandonAllUnfinishedForUser(SecurityUtils.currentUserId())
    }
}
