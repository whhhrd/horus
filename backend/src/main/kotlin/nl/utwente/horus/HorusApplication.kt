package nl.utwente.horus

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class HorusApplication

fun main(args: Array<String>) {
	runApplication<HorusApplication>(*args)
}

