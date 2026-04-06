package com.edumaterials.api.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class TopicResponse(
    val id: String,
    val name: String,
    val description: String?,
    /** Явное имя JSON: иначе Jackson может отдать `hlow` вместо `hLow`. */
    @get:JsonProperty("hLow")
    val hLow: Double,
    @get:JsonProperty("hHigh")
    val hHigh: Double,
)

data class TopicCreateRequest(
    @field:NotBlank @field:Size(max = 300) val name: String,
    @field:Size(max = 4000) val description: String?,
    /** Если null — подставляются глобальные дефолты из конфигурации приложения. */
    @field:DecimalMin("0.0") @field:DecimalMax("1.0") val hLow: Double? = null,
    @field:DecimalMin("0.0") @field:DecimalMax("1.0") val hHigh: Double? = null,
)

data class TopicUpdateRequest(
    @field:NotBlank @field:Size(max = 300) val name: String,
    @field:Size(max = 4000) val description: String?,
    @field:NotNull @field:DecimalMin("0.0") @field:DecimalMax("1.0") val hLow: Double,
    @field:NotNull @field:DecimalMin("0.0") @field:DecimalMax("1.0") val hHigh: Double,
)
