package com.edumaterials.api

import com.edumaterials.AbstractIntegrationTest
import com.edumaterials.testsupport.AuthApi
import com.edumaterials.testsupport.DemoUsers
import io.restassured.RestAssured.given
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.notNullValue
import org.junit.jupiter.api.Test

class AuthLoginApiTest : AbstractIntegrationTest() {

    @Test
    fun loginReturnsJwtForDemoTeacher() {
        val token = AuthApi.loginAsTeacher()
        assertThat(token).isNotBlank()

        given()
            .header("Authorization", "Bearer $token")
            .`when`()
            .get("/auth/me")
            .then()
            .statusCode(200)
            .body("role", equalTo("teacher"))
            .body("name", notNullValue())
    }

    @Test
    fun loginReturnsJwtForDemoStudent() {
        given()
            .contentType(io.restassured.http.ContentType.JSON)
            .body(
                mapOf(
                    "login" to DemoUsers.STUDENT_LOGIN,
                    "password" to DemoUsers.STUDENT_PASSWORD,
                ),
            )
            .`when`()
            .post("/auth/login")
            .then()
            .statusCode(200)
            .body("accessToken", notNullValue())
            .body("user.role", equalTo("student"))
    }

    @Test
    fun loginFailsWithWrongPassword() {
        given()
            .contentType(io.restassured.http.ContentType.JSON)
            .body(
                mapOf(
                    "login" to DemoUsers.TEACHER_LOGIN,
                    "password" to "wrong-password",
                ),
            )
            .`when`()
            .post("/auth/login")
            .then()
            .statusCode(400)
    }
}
