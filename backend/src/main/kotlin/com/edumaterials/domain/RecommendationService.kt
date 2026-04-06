package com.edumaterials.domain

import com.edumaterials.data.entity.Material
import com.edumaterials.data.repository.MaterialRepository
import org.springframework.stereotype.Service

@Service
class RecommendationService(
    private val materialRepository: MaterialRepository,
) {
    fun masteryLabel(mastery: Double, hLow: Double, hHigh: Double): String =
        when {
            mastery < hLow -> "repeat"
            mastery < hHigh -> "consolidate"
            else -> "mastered"
        }

    fun pickMaterials(topicId: Long, mastery: Double, hLow: Double, hHigh: Double): List<Material> {
        val range = when {
            mastery < hLow -> 1..2
            mastery < hHigh -> 3..3
            else -> 4..5
        }
        val all = materialRepository.findByTopicIdOrderByTitleAsc(topicId)
        val filtered = all.filter { it.difficultyLevel in range }
        return filtered.ifEmpty { all }
    }
}
