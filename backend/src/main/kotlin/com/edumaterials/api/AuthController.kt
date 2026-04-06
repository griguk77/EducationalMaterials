package com.edumaterials.api

import com.edumaterials.api.dto.LoginRequest
import com.edumaterials.api.dto.RegisterRequest
import com.edumaterials.api.dto.UserResponse
import com.edumaterials.data.repository.UserRepository
import com.edumaterials.domain.AuthService
import com.edumaterials.domain.toResponse
import com.edumaterials.security.SecurityUtils
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val userRepository: UserRepository,
) {
    @PostMapping("/register")
    fun register(@Valid @RequestBody body: RegisterRequest) = authService.register(body)

    @PostMapping("/login")
    fun login(@Valid @RequestBody body: LoginRequest) = authService.login(body)

    @GetMapping("/me")
    fun me(): UserResponse {
        val id = SecurityUtils.currentUserId()
        val user = userRepository.findById(id).orElseThrow {
            IllegalArgumentException("Пользователь не найден")
        }
        return user.toResponse()
    }
}
