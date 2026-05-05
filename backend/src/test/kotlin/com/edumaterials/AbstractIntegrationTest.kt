package com.edumaterials

import com.edumaterials.testsupport.RestAssuredSupport
import org.junit.jupiter.api.BeforeEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort

/**
 * Базовый класс для HTTP-интеграционных тестов.
 *
 * При запуске из IDEA или `./gradlew test` **отдельно поднимать сервер не нужно**:
 * `@SpringBootTest` поднимает полный контекст Spring Boot (как при обычном старте приложения),
 * а `webEnvironment = RANDOM_PORT` дополнительно запускает встроенный веб-сервер (Tomcat)
 * на **случайном порту** только в этом JVM-процессе теста. RestAssured отправляет HTTP на этот порт —
 * по сути те же запросы, что при ручном `bootRun`, только сервер стартует и гаснет автоматически.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class AbstractIntegrationTest {

    @LocalServerPort
    protected var serverPort: Int = 0

    @BeforeEach
    fun setupRestAssured() {
        RestAssuredSupport.configure(serverPort)
    }
}
