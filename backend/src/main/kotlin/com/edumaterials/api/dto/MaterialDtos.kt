package com.edumaterials.api.dto

import com.edumaterials.data.entity.MaterialType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class MaterialResponse(
    val id: String,
    val topicId: String,
    val title: String,
    val link: String,
    val type: MaterialType,
    val difficultyLevel: Int,
)

data class MaterialCreateRequest(
    @field:NotBlank @field:Size(max = 500) val title: String,
    @field:NotBlank @field:Size(max = 2000) val link: String,
    @field:NotNull val type: MaterialType,
    @field:Min(1) @field:Max(5) val difficultyLevel: Int,
)

data class MaterialUpdateRequest(
    @field:NotBlank @field:Size(max = 500) val title: String,
    @field:NotBlank @field:Size(max = 2000) val link: String,
    @field:NotNull val type: MaterialType,
    @field:Min(1) @field:Max(5) val difficultyLevel: Int,
)
