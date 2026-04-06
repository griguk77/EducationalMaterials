package com.edumaterials.domain

import com.edumaterials.api.dto.AuthResponse
import com.edumaterials.api.dto.LoginRequest
import com.edumaterials.api.dto.RegisterRequest
import com.edumaterials.data.entity.User
import com.edumaterials.data.repository.UserRepository
import com.edumaterials.security.JwtService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) {
    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        val login = request.login.trim()
        if (userRepository.findByLogin(login).isPresent) {
            throw IllegalArgumentException("Логин уже занят")
        }
        val user = User(
            login = login,
            passwordHash = passwordEncoder.encode(request.password),
            name = request.name.trim(),
            role = request.role,
        )
        val saved = userRepository.save(user)
        return AuthResponse(
            accessToken = jwtService.generateToken(saved),
            user = saved.toResponse(),
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val login = request.login.trim()
        val user = userRepository.findByLogin(login).orElseThrow {
            IllegalArgumentException("Неверный логин или пароль")
        }
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw IllegalArgumentException("Неверный логин или пароль")
        }
        return AuthResponse(
            accessToken = jwtService.generateToken(user),
            user = user.toResponse(),
        )
    }
}
