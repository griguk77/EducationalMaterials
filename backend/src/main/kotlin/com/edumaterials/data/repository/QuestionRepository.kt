package com.edumaterials.data.repository

import com.edumaterials.data.entity.Question
import org.springframework.data.jpa.repository.JpaRepository

interface QuestionRepository : JpaRepository<Question, Long> {
    fun findByTopicIdOrderByOrderIndexAsc(topicId: Long): List<Question>

    fun countByTopicId(topicId: Long): Long
}
