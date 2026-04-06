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
@Table(name = "materials")
class Material(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Column(name = "topic_id", nullable = false)
    var topicId: Long = 0,
    @Column(nullable = false, length = 500)
    var title: String = "",
    @Column(nullable = false, length = 2000)
    var link: String = "",
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: MaterialType = MaterialType.ARTICLE,
    /** Уровень сложности материала 1..5 для подбора по степени усвоения. */
    @Column(name = "difficulty_level", nullable = false)
    var difficultyLevel: Int = 3,
)
