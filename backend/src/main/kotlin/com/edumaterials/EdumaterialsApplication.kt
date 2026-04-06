package com.edumaterials

import com.edumaterials.config.AppProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(AppProperties::class)
class EdumaterialsApplication

fun main(args: Array<String>) {
    runApplication<EdumaterialsApplication>(*args)
}
