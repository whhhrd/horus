package nl.utwente.horus.auth.handlers

import com.fasterxml.jackson.databind.ObjectMapper
import nl.utwente.horus.auth.tokens.TokenPair
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.representations.auth.AuthTokenResponse
import nl.utwente.horus.representations.auth.HorusAuthorityDto
import nl.utwente.horus.representations.person.PersonDtoFull
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Handles a successful login and writes a JSON response with a refresh token.
 */
@Component
class LoginSuccessHandler: AuthenticationSuccessHandler {

    private val objectMapper = ObjectMapper()

    override fun onAuthenticationSuccess(request: HttpServletRequest?, response: HttpServletResponse?, authentication: Authentication?) {
        // After login, Authentication returned from the filter's attemptAuthentication
        // is a TokenPair. Here's its encoded string representation is taken
        // and written as JSON to the response.
        val tokens: TokenPair = authentication as TokenPair

        response!!.status = HttpStatus.OK.value()
        response.contentType = MediaType.APPLICATION_JSON_UTF8_VALUE

        objectMapper.writeValue(
                response.writer,
                AuthTokenResponse(
                        tokens.accessToken.token,
                        tokens.refreshToken.token,
                        tokens.refreshToken.userDetails!!.horusAuthorities.map { HorusAuthorityDto(it) }
                )
        )

    }
}