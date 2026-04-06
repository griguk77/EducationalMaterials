package com.edumaterials.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "questions")
class Question(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Column(name = "topic_id", nullable = false)
    var topicId: Long = 0,
    @Column(nullable = false, length = 4000)
    var text: String = "",
    /**
     * JSON: варианты для single/multiple, например [{"id":"a","text":"..."}].
     * Для TEXT может быть null.
     */
    @Column(name = "options_json", columnDefinition = "CLOB")
    var optionsJson: String? = null,
    /**
     * Один id варианта, JSON-массив id, или эталонный текст для TEXT.
     */
    @Column(name = "correct_answer", nullable = false, columnDefinition = "CLOB")
    var correctAnswer: String = "",
    /** Относительная сложность 0..1 (d_i при отсутствии статистики). */
    @Column(nullable = false)
    var difficulty: Double = 0.5,
    @Enumerated(EnumType.STRING)
    @Column(name = "answer_type", nullable = false, length = 20)
    var answerType: AnswerType = AnswerType.SINGLE,
    /** Нормативное время T_i (мс); если null — берётся default из конфигурации. */
    @Column(name = "normative_time_ms")
    var normativeTimeMs: Long? = null,
    @Column(name = "order_index", nullable = false)
    var orderIndex: Int = 0,
)
