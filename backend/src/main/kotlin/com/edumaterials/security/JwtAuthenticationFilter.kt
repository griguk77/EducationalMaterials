package com.edumaterials.security

import com.edumaterials.data.repository.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val header = request.getHeader(HttpHeaders.AUTHORIZATION)
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            val token = header.substring(BEARER_PREFIX.length).trim()
            if (token.isNotEmpty() && jwtService.validate(token)) {
                try {
                    val userId = jwtService.parseUserId(token)
                    val user = userRepository.findById(userId).orElse(null)
                    if (user != null) {
                        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))
                        val auth = UsernamePasswordAuthenticationToken(
                            user.id.toString(),
                            null,
                            authorities,
                        )
                        SecurityContextHolder.getContext().authentication = auth
                    }
                } catch (_: Exception) {
                    SecurityContextHolder.clearContext()
                }
            }
        }
        filterChain.doFilter(request, response)
    }

    companion object {
        private const val BEARER_PREFIX = "Bearer "
    }
}
