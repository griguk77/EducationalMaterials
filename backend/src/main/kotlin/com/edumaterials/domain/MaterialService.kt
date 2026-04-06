package com.edumaterials.domain

import com.edumaterials.api.dto.MaterialCreateRequest
import com.edumaterials.api.dto.MaterialResponse
import com.edumaterials.api.dto.MaterialUpdateRequest
import com.edumaterials.data.entity.Material
import com.edumaterials.data.repository.MaterialRepository
import com.edumaterials.data.repository.TopicRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MaterialService(
    private val topicRepository: TopicRepository,
    private val materialRepository: MaterialRepository,
) {
    @Transactional(readOnly = true)
    fun listForTopic(topicId: Long): List<MaterialResponse> {
        ensureTopic(topicId)
        return materialRepository.findByTopicIdOrderByTitleAsc(topicId).map { it.toResponse() }
    }

    @Transactional
    fun create(topicId: Long, request: MaterialCreateRequest): MaterialResponse {
        ensureTopic(topicId)
        val m = Material(
            topicId = topicId,
            title = request.title.trim(),
            link = request.link.trim(),
            type = request.type,
            difficultyLevel = request.difficultyLevel.coerceIn(1, 5),
        )
        return materialRepository.save(m).toResponse()
    }

    @Transactional
    fun update(topicId: Long, materialId: Long, request: MaterialUpdateRequest): MaterialResponse {
        val m = materialRepository.findById(materialId).orElseThrow {
            IllegalArgumentException("Материал не найден")
        }
        if (m.topicId != topicId) {
            throw IllegalArgumentException("Материал не относится к теме")
        }
        m.title = request.title.trim()
        m.link = request.link.trim()
        m.type = request.type
        m.difficultyLevel = request.difficultyLevel.coerceIn(1, 5)
        return materialRepository.save(m).toResponse()
    }

    @Transactional
    fun delete(topicId: Long, materialId: Long) {
        val m = materialRepository.findById(materialId).orElseThrow {
            IllegalArgumentException("Материал не найден")
        }
        if (m.topicId != topicId) {
            throw IllegalArgumentException("Материал не относится к теме")
        }
        materialRepository.delete(m)
    }

    private fun ensureTopic(topicId: Long) {
        if (!topicRepository.existsById(topicId)) {
            throw IllegalArgumentException("Тема не найдена")
        }
    }
}
