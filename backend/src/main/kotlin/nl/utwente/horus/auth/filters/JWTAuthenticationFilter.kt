package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.tokens.RawToken
import nl.utwente.horus.auth.util.HttpUtil
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import javax.servlet.FilterChain
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * JWTAuthenticationFilter checks for an appropriate token header with token data,
 * extracts this data, and authenticates the token with the AuthenticationManager
 * (which calls the JWTAuthenticationProvider to perform the checks). Upon successful
 * authentication, a new SecurityContext is created and the authenticated RefreshToken
 * or AccessToken is stored there for filters further down the chain.
 */
class JWTAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {
        // Check and extract header
        val authHeader: String? = request!!.getHeader(AUTHORIZATION_HEADER_NAME)
        val authParam: String? = request.getParameter(AUTHORIZATION_PARAMETER_NAME)
        if (authParam == null && (authHeader == null || authHeader.length < AUTHORIZATION_HEADER_PREFIX.length ||
                        !authHeader.startsWith(AUTHORIZATION_HEADER_PREFIX))) {
            throw BadCredentialsException("Token not provided")
        }

        // Authenticates the token with the AuthenticationManager,
        // which calls the JWTAuthenticationProvider to perform the checks
        val token = authParam ?: authHeader!!.substring(AUTHORIZATION_HEADER_PREFIX.length)
        val clientId = HttpUtil.extractClientTokenCookie(request)
        return authenticationManager.authenticate(RawToken(token, clientId))
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        // Upon successful authentication, create a new SecurityContext and
        // store the authenticated RefreshToken  or AccessToken is stored there
        // for filters further down the chain.
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authResult
        SecurityContextHolder.setContext(context)
        chain!!.doFilter(request, response)
    }
}