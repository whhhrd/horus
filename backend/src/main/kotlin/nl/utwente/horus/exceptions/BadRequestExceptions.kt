package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

abstract class BadRequestException(message: String, code: String? = null) : HorusException(message, HttpStatus.BAD_REQUEST, code)

// Course-related
class WrongCourseException : BadRequestException("This entity does not belong to the indicated course.")

// Assignment-related
class InvalidAssignmentCreateRequestException(message: String) : BadRequestException(message)

class InvalidAssignmentUpdateRequestException(message: String) : BadRequestException(message)

// Canvas-related
class CanvasTokenNotFoundException : BadRequestException("The action required a Canvas token, " +
        "which is not present for this entity.")

class InvalidCanvasTokenException : BadRequestException("Used Canvas token invalid.")