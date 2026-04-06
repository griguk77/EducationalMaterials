package com.edumaterials.data.repository

import com.edumaterials.data.entity.Topic
import org.springframework.data.jpa.repository.JpaRepository

interface TopicRepository : JpaRepository<Topic, Long>
