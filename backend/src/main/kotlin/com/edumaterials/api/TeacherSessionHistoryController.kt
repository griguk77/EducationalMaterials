package com.edumaterials.api

import com.edumaterials.domain.TestSessionService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/teacher/sessions")
@PreAuthorize("hasRole('TEACHER')")
class TeacherSessionHistoryController(
    private val testSessionService: TestSessionService,
) {
    @GetMapping
    fun list() = testSessionService.listAllSessionsForTeacher()
}
