package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

open class UnauthorizedException(message: String, code: String? = null) :
        HorusException(message, HttpStatus.UNAUTHORIZED, code)

class AuthenticationRequiredException: UnauthorizedException("Authentication required")
