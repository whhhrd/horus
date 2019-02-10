package nl.utwente.horus.auth.handlers

import com.fasterxml.jackson.databind.ObjectMapper
import nl.utwente.horus.representations.auth.AuthTokenResponse
import nl.utwente.horus.auth.tokens.AccessToken
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Handles a successful granting of an access token and writes a JSON response with it.
 */
@Component
class AccessTokenRequestSuccessHandler: AuthenticationSuccessHandler {

    private val objectMapper = ObjectMapper()

    override fun onAuthenticationSuccess(request: HttpServletRequest?, response: HttpServletResponse?, authentication: Authentication?) {
        // After a successful granting of an access token, Authentication returned from the filter's attemptAuthenticaion
        // MUST be an AccessToken. Here's its encoded string representation is taken
        // and written as JSON to the response.
        val accessToken = authentication as AccessToken

        response!!.status = HttpStatus.OK.value()
        response.contentType = MediaType.APPLICATION_JSON_UTF8_VALUE

        objectMapper.writeValue(response.writer, AuthTokenResponse(accessToken.token, null))

    }
}