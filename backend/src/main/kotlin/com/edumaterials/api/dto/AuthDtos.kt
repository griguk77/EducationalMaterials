package com.edumaterials.api.dto

import com.edumaterials.data.entity.UserRole
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank @field:Size(max = 128) val login: String,
    @field:NotBlank @field:Size(min = 8, max = 200) val password: String,
    @field:NotBlank @field:Size(max = 200) val name: String,
    @field:NotNull val role: UserRole,
)

data class LoginRequest(
    @field:NotBlank val login: String,
    @field:NotBlank val password: String,
)

data class AuthResponse(
    val accessToken: String,
    val user: UserResponse,
)

data class UserResponse(
    val id: String,
    val name: String,
    /** student | teacher — как ожидает фронтенд */
    val role: String,
)
