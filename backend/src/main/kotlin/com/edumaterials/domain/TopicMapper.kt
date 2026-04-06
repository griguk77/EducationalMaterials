package com.edumaterials.domain

import com.edumaterials.api.dto.TopicResponse
import com.edumaterials.data.entity.Topic

fun Topic.toResponse(): TopicResponse =
    TopicResponse(
        id = id.toString(),
        name = name,
        description = description,
        hLow = hLow,
        hHigh = hHigh,
    )
