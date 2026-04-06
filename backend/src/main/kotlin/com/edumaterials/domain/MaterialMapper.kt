package com.edumaterials.domain

import com.edumaterials.api.dto.MaterialResponse
import com.edumaterials.data.entity.Material

fun Material.toResponse(): MaterialResponse =
    MaterialResponse(
        id = id.toString(),
        topicId = topicId.toString(),
        title = title,
        link = link,
        type = type,
        difficultyLevel = difficultyLevel,
    )
