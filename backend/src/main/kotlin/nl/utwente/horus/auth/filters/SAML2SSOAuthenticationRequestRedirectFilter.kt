package nl.utwente.horus.auth.filters

import org.pac4j.core.context.J2EContext
import org.pac4j.saml.client.SAML2Client
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class SAML2SSOAuthenticationRequestRedirectFilter: OncePerRequestFilter {

    private val requestMatcher: RequestMatcher
    private val saml2Client : SAML2Client

    constructor(requestMatcher: RequestMatcher, saml2Client: SAML2Client) {
        this.requestMatcher = requestMatcher
        this.saml2Client = saml2Client
    }

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        if (!requestMatcher.matches(request)) {
            filterChain.doFilter(request, response)
            return
        }
        saml2Client.redirect(J2EContext(request, response))
    }
}