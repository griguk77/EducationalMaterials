package com.edumaterials.data.repository

import com.edumaterials.data.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
    fun findByLogin(login: String): Optional<User>
}
