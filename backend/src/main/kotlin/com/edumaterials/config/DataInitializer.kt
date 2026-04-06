package com.edumaterials.config

import com.edumaterials.data.entity.AnswerType
import com.edumaterials.data.entity.Material
import com.edumaterials.data.entity.MaterialType
import com.edumaterials.data.entity.Question
import com.edumaterials.data.entity.Topic
import com.edumaterials.data.entity.User
import com.edumaterials.data.entity.UserRole
import com.edumaterials.data.repository.MaterialRepository
import com.edumaterials.data.repository.QuestionRepository
import com.edumaterials.data.repository.TopicRepository
import com.edumaterials.data.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class DataInitializer {
    @Bean
    fun seedData(
        userRepository: UserRepository,
        topicRepository: TopicRepository,
        questionRepository: QuestionRepository,
        materialRepository: MaterialRepository,
        passwordEncoder: PasswordEncoder,
    ) = CommandLineRunner {
        if (userRepository.count() > 0) return@CommandLineRunner

        userRepository.save(
            User(
                login = "teacher",
                passwordHash = passwordEncoder.encode("teacher123"),
                name = "Преподаватель (демо)",
                role = UserRole.TEACHER,
            ),
        )
        userRepository.save(
            User(
                login = "student",
                passwordHash = passwordEncoder.encode("student123"),
                name = "Обучающийся (демо)",
                role = UserRole.STUDENT,
            ),
        )

        val topic1 = topicRepository.save(
            Topic(
                name = "Введение в дисциплину",
                description = "Пример темы для демонстрации теста и рекомендаций.",
            ),
        )
        topicRepository.save(
            Topic(
                name = "Основные понятия",
                description = "Вторая тема для примера списка тем.",
            ),
        )

        questionRepository.save(
            Question(
                topicId = topic1.id,
                text = "Выберите верный вариант: что такое тестирование знаний?",
                optionsJson = """[{"id":"a","text":"Оценка усвоения материала"},{"id":"b","text":"Только устный опрос"}]""",
                correctAnswer = "a",
                difficulty = 0.35,
                answerType = AnswerType.SINGLE,
                normativeTimeMs = 45_000,
                orderIndex = 0,
            ),
        )
        questionRepository.save(
            Question(
                topicId = topic1.id,
                text = "Введите ключевое слово: обучение (без кавычек, маленькими буквами).",
                optionsJson = null,
                correctAnswer = "обучение",
                difficulty = 0.55,
                answerType = AnswerType.TEXT,
                normativeTimeMs = 60_000,
                orderIndex = 1,
            ),
        )
        questionRepository.save(
            Question(
                topicId = topic1.id,
                text = "Отметьте все подходящие утверждения (адаптивное обучение).",
                optionsJson = """[{"id":"a","text":"Учитывает индивидуальные особенности"},{"id":"b","text":"Всегда требует ML"},{"id":"c","text":"Может подбирать материалы по результатам теста"}]""",
                correctAnswer = """["a","c"]""",
                difficulty = 0.7,
                answerType = AnswerType.MULTIPLE,
                normativeTimeMs = 90_000,
                orderIndex = 2,
            ),
        )

        materialRepository.save(
            Material(
                topicId = topic1.id,
                title = "Вводная статья (лёгкий уровень)",
                link = "https://example.com/article-intro",
                type = MaterialType.ARTICLE,
                difficultyLevel = 1,
            ),
        )
        materialRepository.save(
            Material(
                topicId = topic1.id,
                title = "Закрепляющий материал (средний уровень)",
                link = "https://example.com/article-mid",
                type = MaterialType.ARTICLE,
                difficultyLevel = 3,
            ),
        )
        materialRepository.save(
            Material(
                topicId = topic1.id,
                title = "Углублённое видео (высокий уровень)",
                link = "https://example.com/video-advanced",
                type = MaterialType.VIDEO,
                difficultyLevel = 5,
            ),
        )
    }
}
