package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
class InvalidCanvasTokenException : RuntimeException("Used Canvas token invalid.")