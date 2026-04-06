package com.edumaterials.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "answer_results")
class AnswerResult(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Column(name = "test_session_id", nullable = false)
    var testSessionId: Long = 0,
    @Column(name = "question_id", nullable = false)
    var questionId: Long = 0,
    @Column(name = "user_answer", nullable = false, columnDefinition = "CLOB")
    var userAnswer: String = "",
    @Column(name = "is_correct", nullable = false)
    var isCorrect: Boolean = false,
    @Column(nullable = false)
    var score: Double = 0.0,
    @Column(name = "response_time_ms", nullable = false)
    var responseTimeMs: Long = 0,
    /** Частичная оценка q_i по формуле из документации. */
    @Column(name = "partial_score", nullable = false)
    var partialScore: Double = 0.0,
)
