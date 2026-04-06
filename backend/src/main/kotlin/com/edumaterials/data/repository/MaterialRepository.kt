package com.edumaterials.data.repository

import com.edumaterials.data.entity.Material
import org.springframework.data.jpa.repository.JpaRepository

interface MaterialRepository : JpaRepository<Material, Long> {
    fun findByTopicIdOrderByTitleAsc(topicId: Long): List<Material>

    fun findByTopicIdAndDifficultyLevelBetween(
        topicId: Long,
        minLevel: Int,
        maxLevel: Int,
    ): List<Material>
}
