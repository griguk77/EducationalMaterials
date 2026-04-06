package com.edumaterials.domain

import com.edumaterials.api.dto.TopicCreateRequest
import com.edumaterials.api.dto.TopicResponse
import com.edumaterials.api.dto.TopicUpdateRequest
import com.edumaterials.config.AppProperties
import com.edumaterials.data.entity.Topic
import com.edumaterials.data.repository.TopicRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TopicService(
    private val topicRepository: TopicRepository,
    private val appProperties: AppProperties,
) {
    @Transactional(readOnly = true)
    fun list(): List<TopicResponse> = topicRepository.findAll().map { it.toResponse() }

    @Transactional(readOnly = true)
    fun get(id: Long): TopicResponse {
        val topic = topicRepository.findById(id).orElseThrow {
            IllegalArgumentException("Тема не найдена")
        }
        return topic.toResponse()
    }

    @Transactional
    fun create(request: TopicCreateRequest): TopicResponse {
        val def = appProperties.recommendation
        val hLow = request.hLow ?: def.hlow
        val hHigh = request.hHigh ?: def.hhigh
        validateThresholds(hLow, hHigh)
        val topic = Topic(
            name = request.name.trim(),
            description = request.description?.trim(),
            hLow = hLow,
            hHigh = hHigh,
        )
        return topicRepository.save(topic).toResponse()
    }

    @Transactional
    fun update(id: Long, request: TopicUpdateRequest): TopicResponse {
        val topic = topicRepository.findById(id).orElseThrow {
            IllegalArgumentException("Тема не найдена")
        }
        validateThresholds(request.hLow, request.hHigh)
        topic.name = request.name.trim()
        topic.description = request.description?.trim()
        topic.hLow = request.hLow
        topic.hHigh = request.hHigh
        return topicRepository.save(topic).toResponse()
    }

    private fun validateThresholds(hLow: Double, hHigh: Double) {
        require(hLow < hHigh) { "Порог h_low должен быть строго меньше h_high" }
    }

    @Transactional
    fun delete(id: Long) {
        if (!topicRepository.existsById(id)) {
            throw IllegalArgumentException("Тема не найдена")
        }
        topicRepository.deleteById(id)
    }
}
