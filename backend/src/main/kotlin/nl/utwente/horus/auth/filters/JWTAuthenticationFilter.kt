package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.tokens.RawToken
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder

/**
 * JWTAuthenticationFilter checks for an appropriate token header with token data,
 * extracts this data, and authenticates the token with the AuthenticationManager
 * (which calls the JWTAuthenticationProvider to perform the checks). Upon successful
 * authentication, a new SecurityContext is created and the authenticated RefreshToken
 * or AccessToken is stored there for filters further down the chain.
 */
class JWTAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    companion object {
        const val AUTHORIZATON_HEADER_NAME = "Authorization"
        const val AUTHORIZATON_HEADER_PREFIX = "Bearer "
    }

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {
        // Check and exract header
        val authHeader = request!!.getHeader(AUTHORIZATON_HEADER_NAME)
        if (authHeader == null || authHeader.length < AUTHORIZATON_HEADER_PREFIX.length || !authHeader.startsWith(AUTHORIZATON_HEADER_PREFIX)) {
            throw BadCredentialsException("Token not provided")
        }

        // Authenticates the token with the AuthenticationManager,
        // which calls the JWTAuthenticationProvider to perform the checks
        return authenticationManager.authenticate(RawToken(authHeader.substring(AUTHORIZATON_HEADER_PREFIX.length)))
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