package nl.utwente.horus

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EntityScan
@EnableJpaRepositories
@EnableAsync
@EnableScheduling
class HorusApplication

fun main(args: Array<String>) {
    runApplication<HorusApplication>(*args)
}

