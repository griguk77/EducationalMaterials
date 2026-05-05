package com.edumaterials.testsupport

import io.restassured.RestAssured
import io.restassured.http.ContentType
import io.restassured.specification.RequestSpecification

/**
 * Мини-фреймворк поверх RestAssured: единая точка настройки порта/URI и удобные вызовы API.
 */
object RestAssuredSupport {

    fun configure(port: Int) {
        RestAssured.baseURI = "http://127.0.0.1"
        RestAssured.port = port
        RestAssured.basePath = "/api"
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()
    }

    fun bearer(token: String): RequestSpecification =
        RestAssured.given().header("Authorization", "Bearer $token")

    fun jsonBody(body: Any): RequestSpecification =
        RestAssured.given().contentType(ContentType.JSON).body(body)
}

/** Учётные данные демо-пользователей из [com.edumaterials.config.DataInitializer]. */
object DemoUsers {
    const val TEACHER_LOGIN = "teacher"
    const val TEACHER_PASSWORD = "teacher123"
    const val STUDENT_LOGIN = "student"
    const val STUDENT_PASSWORD = "student123"
}

object AuthApi {
    fun login(login: String, password: String): String =
        RestAssuredSupport.jsonBody(
            mapOf(
                "login" to login,
                "password" to password,
            ),
        )
            .`when`()
            .post("/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .path("accessToken")

    fun loginAsTeacher(): String = login(DemoUsers.TEACHER_LOGIN, DemoUsers.TEACHER_PASSWORD)

    fun loginAsStudent(): String = login(DemoUsers.STUDENT_LOGIN, DemoUsers.STUDENT_PASSWORD)
}
