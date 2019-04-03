package nl.utwente.horus.auth.filters

import com.fasterxml.jackson.databind.ObjectMapper
import nl.utwente.horus.auth.handlers.LoginSuccessHandler
import nl.utwente.horus.auth.tokens.UsernamePasswordToken
import nl.utwente.horus.auth.util.HttpUtil
import nl.utwente.horus.representations.auth.PasswordLoginRequest
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.web.server.MethodNotAllowedException
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * PasswordLoginAuthenticationFilter parses a PasswordLoginRequest in the request body,
 * and enables login in this way.
 */
class PasswordLoginAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    // Initialize success handler to send token response on successful authentication
    private val successHandler = LoginSuccessHandler()

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        // Check if method is POST
        if (!HttpMethod.POST.matches(request!!.method)) {
            throw MethodNotAllowedException(request.method, Arrays.asList(HttpMethod.POST))
        }

        // Deserialize JSON in request
        val passwordLoginRequest: PasswordLoginRequest
        try {
            passwordLoginRequest = ObjectMapper().readValue(request.reader, PasswordLoginRequest::class.java)
        } catch (ex: Exception) {
            throw BadCredentialsException("Invalid login request")
        }

        // Perform basic credential checks
        if (passwordLoginRequest.username.isEmpty() || passwordLoginRequest.password.isEmpty()) {
            throw BadCredentialsException("Missing username and/or password")
        }

        val clientId = if (HttpUtil.isFromOrigin(request)) HttpUtil.injectClientTokenCookie(request, response!!) else null

        // Call the AuthenticationManager to authenticate and grant a RefreshToken
        // via the PasswordLoginAuthenticationProvider
        return authenticationManager.authenticate(UsernamePasswordToken(passwordLoginRequest.username, passwordLoginRequest.password, clientId))

    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        // Call the success handler to return the token response
        successHandler.onAuthenticationSuccess(request, response, authResult)
    }

}
