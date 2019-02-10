package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.tokens.AccessToken
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.context.SecurityContextHolder
import javax.servlet.FilterChain

/**
 * EnsureAccessTokenAuthenticationFilter ensures the existence of an AccessToken in the request.
 */
class EnsureAccessTokenAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {
        if (SecurityContextHolder.getContext().authentication == null || SecurityContextHolder.getContext().authentication !is AccessToken) {
            throw BadCredentialsException("Requires access token")
        }
        return SecurityContextHolder.getContext().authentication
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        chain!!.doFilter(request, response)
    }
}
