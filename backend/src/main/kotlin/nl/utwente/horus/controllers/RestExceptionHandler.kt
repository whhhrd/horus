package nl.utwente.horus.controllers

import nl.utwente.horus.exceptions.HorusException
import nl.utwente.horus.representations.error.ErrorDto
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.ServletWebRequest
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@ControllerAdvice
class RestExceptionHandler : ResponseEntityExceptionHandler() {

    @ExceptionHandler(value = [HorusException::class])
    fun handleRestException(ex: HorusException, request: WebRequest): ResponseEntity<Any> {
        val call = (request as ServletWebRequest).request.requestURI
        // Use "manually" supplied code, or the class name of the exception as backup.
        val code = ex.code ?: ex::class.simpleName!! // Can only be null when using anonymous classes
        // Ex.message is always supplied when using HorusException. Nullability due to superclass
        val result = ErrorDto(call, ex.message!!, code)
        return handleExceptionInternal(ex, result, HttpHeaders(), ex.httpStatus, request)
    }
}