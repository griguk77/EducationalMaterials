package com.edumaterials.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val jwt: Jwt,
    val recommendation: Recommendation,
) {
    data class Jwt(
        val secret: String,
        val expirationMs: Long,
    )

    data class Recommendation(
        val hlow: Double,
        val hhigh: Double,
        val defaultNormativeTimeMs: Long,
    )
}
