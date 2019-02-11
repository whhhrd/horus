package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.handlers.AccessTokenRequestSuccessHandler
import org.springframework.http.HttpMethod
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.server.MethodNotAllowedException
import java.util.*

/**
 * AccessTokenRequestAuthenticationFilter intercepts a request matching the given pattern,
 * and gets a new AccessToken by calling the AuthenticationManager (which calls the
 * AccessTokenRequestAuthenticationProvider) to obtain a new AccessToken after requisite checks.
 */
class AccessTokenRequestAuthenticationFilter(requiresAuthenticationRequestMatcher: RequestMatcher?) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {

    // Initialize success handler to send token response on successful authentication
    private val successHandler = AccessTokenRequestSuccessHandler()

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        // Check if method is POST
        if (!HttpMethod.POST.matches(request!!.method)) {
            throw MethodNotAllowedException(request.method, Arrays.asList(HttpMethod.POST))
        }

        // Check if there's valid authentication in the security context
        if (SecurityContextHolder.getContext().authentication == null) {
            throw BadCredentialsException("Request unauthenticated")
        }

        // If there is, forward this to the manager (which authenticates using a registered provider)
        return authenticationManager.authenticate(SecurityContextHolder.getContext().authentication)

    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        // Call handler to send access token response
        successHandler.onAuthenticationSuccess(request, response, authResult)
    }

}
