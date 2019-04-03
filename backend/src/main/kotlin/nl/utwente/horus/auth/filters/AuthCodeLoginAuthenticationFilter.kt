package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.handlers.LoginSuccessHandler
import nl.utwente.horus.auth.tokens.AuthCodeToken
import nl.utwente.horus.auth.util.HttpUtil
import org.springframework.http.HttpMethod
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.server.MethodNotAllowedException
import java.util.*

/**
 * AuthCodeLoginAuthenticationFilter extracts an auth code from the Authorization header,
 * and enables login in this way.
 */
class AuthCodeLoginAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    // Initialize success handler to send token response on successful authentication
    private val successHandler = LoginSuccessHandler()

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        // Check if method is POST
        if (!HttpMethod.POST.matches(request!!.method)) {
            throw MethodNotAllowedException(request.method, Arrays.asList(HttpMethod.POST))
        }

        // Check and extract header
        val authHeader = request!!.getHeader(AUTHORIZATION_HEADER_NAME)
        if (authHeader == null || authHeader.length < AUTHORIZATION_HEADER_PREFIX.length || !authHeader.startsWith(AUTHORIZATION_HEADER_PREFIX)) {
            throw BadCredentialsException("Auth code not provided")
        }

        val clientId = if (HttpUtil.isFromOrigin(request)) HttpUtil.injectClientTokenCookie(request, response!!) else null

        // via the AuthCodeLoginAuthenticationProvider
        return authenticationManager.authenticate(AuthCodeToken(authHeader.substring(AUTHORIZATION_HEADER_PREFIX.length), clientId))

    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        // Call the success handler to return the token response

        successHandler.onAuthenticationSuccess(request, response, authResult)
    }

}
