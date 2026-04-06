package com.edumaterials.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "test_sessions")
class TestSession(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,
    @Column(name = "topic_id", nullable = false)
    var topicId: Long = 0,
    @Column(name = "started_at", nullable = false)
    var startedAt: Instant = Instant.now(),
    @Column(name = "finished_at")
    var finishedAt: Instant? = null,
    /** Индекс следующего вопроса (0-based). */
    @Column(name = "current_question_index", nullable = false)
    var currentQuestionIndex: Int = 0,
    @Column(nullable = false)
    var finished: Boolean = false,
    /** Уровень усвоения M_C по теме после завершения. */
    @Column(name = "mastery_score")
    var masteryScore: Double? = null,
)
