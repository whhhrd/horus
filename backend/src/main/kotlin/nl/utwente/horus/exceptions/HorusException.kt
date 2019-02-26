package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

abstract class HorusException(message: String, val httpStatus: HttpStatus,
                              var code: String?) : RuntimeException(message)
