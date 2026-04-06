package com.edumaterials.api

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException::class)
    fun badRequest(e: IllegalArgumentException): ResponseEntity<Map<String, String?>> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            mapOf("error" to (e.message ?: "Некорректный запрос")),
        )

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun validation(e: MethodArgumentNotValidException): ResponseEntity<Map<String, String?>> {
        val first = e.bindingResult.fieldErrors.firstOrNull()
        val msg = first?.let { "${it.field}: ${it.defaultMessage}" } ?: "Ошибка валидации"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to msg))
    }
}
