package com.edumaterials.domain

import com.edumaterials.api.dto.UserResponse
import com.edumaterials.data.entity.User

fun User.toResponse(): UserResponse =
    UserResponse(
        id = id.toString(),
        name = name,
        role = role.name.lowercase(),
    )
