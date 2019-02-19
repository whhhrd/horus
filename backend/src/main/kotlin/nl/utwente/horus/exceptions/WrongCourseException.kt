package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.BAD_REQUEST)
class WrongCourseException : RuntimeException("This entity does not belong to the indicated course.")