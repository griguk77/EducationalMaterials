package com.edumaterials.api

import com.edumaterials.AbstractIntegrationTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.junit.jupiter.api.Test

class RegisterValidationApiTest : AbstractIntegrationTest() {

    @Test
    fun registerRejectsPasswordShorterThan8Characters() {
        given()
            .contentType(ContentType.JSON)
            .body(
                mapOf(
                    "login" to "reg_short_${System.nanoTime()}",
                    "password" to "short",
                    "name" to "Тест",
                    "role" to "STUDENT",
                ),
            )
            .`when`()
            .post("/auth/register")
            .then()
            .statusCode(400)
    }
}
