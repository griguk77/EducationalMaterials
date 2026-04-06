package com.edumaterials.security

import org.springframework.security.core.context.SecurityContextHolder

object SecurityUtils {
    fun currentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
            ?: throw IllegalStateException("Нет контекста аутентификации")
        return auth.name.toLong()
    }
}
