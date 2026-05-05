package com.edumaterials.api

import com.edumaterials.AbstractIntegrationTest
import com.edumaterials.testsupport.AuthApi
import com.edumaterials.testsupport.RestAssuredSupport
import io.restassured.RestAssured
import org.hamcrest.Matchers.greaterThan
import org.hamcrest.Matchers.notNullValue
import org.junit.jupiter.api.Test

class TopicsApiTest : AbstractIntegrationTest() {

    @Test
    fun getTopicsReturnsSeededTopicsForTeacher() {
        val token = AuthApi.loginAsTeacher()
        RestAssuredSupport.bearer(token)
            .`when`()
            .get("/topics")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("[0].name", notNullValue())
            .body("[0].id", notNullValue())
    }

    @Test
    fun getTopicsWithoutTokenReturns401() {
        RestAssured.given()
            .`when`()
            .get("/topics")
            .then()
            .statusCode(401)
    }

    @Test
    fun studentCanListTopics() {
        val token = AuthApi.loginAsStudent()
        RestAssuredSupport.bearer(token)
            .`when`()
            .get("/topics")
            .then()
            .statusCode(200)
            .body("[0].name", notNullValue())
    }
}
