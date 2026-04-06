package com.edumaterials.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "topics")
class Topic(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Column(nullable = false, length = 300)
    var name: String = "",
    @Column(length = 4000)
    var description: String? = null,
    @Column(name = "h_low", nullable = false)
    var hLow: Double = 0.45,
    @Column(name = "h_high", nullable = false)
    var hHigh: Double = 0.75,
)
