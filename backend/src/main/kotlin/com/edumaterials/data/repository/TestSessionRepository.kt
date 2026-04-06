package com.edumaterials.data.repository

import com.edumaterials.data.entity.TestSession
import org.springframework.data.jpa.repository.JpaRepository

interface TestSessionRepository : JpaRepository<TestSession, Long> {
    fun findByUserIdOrderByStartedAtDesc(userId: Long): List<TestSession>

    fun findByTopicIdOrderByStartedAtDesc(topicId: Long): List<TestSession>

    /** Незавершённые сессии по пользователю и теме (новые сверху). */
    fun findByUserIdAndTopicIdAndFinishedIsFalseOrderByIdDesc(
        userId: Long,
        topicId: Long,
    ): List<TestSession>

    /** Все незавершённые сессии пользователя (новые сверху). */
    fun findByUserIdAndFinishedIsFalseOrderByIdDesc(userId: Long): List<TestSession>
}
