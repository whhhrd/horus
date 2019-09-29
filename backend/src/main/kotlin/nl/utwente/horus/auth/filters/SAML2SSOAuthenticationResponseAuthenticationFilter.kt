package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.saml.SAML2AttributeExtractionScheme
import nl.utwente.horus.auth.saml.SAML2AttributeExtractor
import nl.utwente.horus.auth.saml.UTSAML2AttributeExtractionScheme
import nl.utwente.horus.auth.tokens.AuthCodeToken
import org.pac4j.core.context.J2EContext
import org.pac4j.saml.client.SAML2Client
import org.pac4j.saml.credentials.SAML2Credentials
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class SAML2SSOAuthenticationResponseAuthenticationFilter: AbstractAuthenticationProcessingFilter {

    private val saml2Client: SAML2Client

    private val redirectURL: String

    private val attributeExtractor: SAML2AttributeExtractor

    companion object {
        val LOGGER = LoggerFactory.getLogger(SAML2SSOAuthenticationResponseAuthenticationFilter::class.java)
    }

    constructor(attributeExtractionScheme: SAML2AttributeExtractionScheme, requiresAuthenticationRequestMatcher: RequestMatcher?, saml2Client: SAML2Client, redirectURL: String) : super(requiresAuthenticationRequestMatcher) {
        this.saml2Client = saml2Client
        this.redirectURL = redirectURL
        this.attributeExtractor = SAML2AttributeExtractor(attributeExtractionScheme)
    }

    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {
        try {
            val context = saml2Client.contextProvider.buildContext(J2EContext(request, response))
            val credentials = saml2Client.profileHandler.receive(context) as SAML2Credentials

            val auth = attributeExtractor.extractSAMLCredentialsToAuthCredentials(credentials)
            return authenticationManager.authenticate(auth)
        } catch (e: Exception) {
            e.printStackTrace()
            LOGGER.error(e.message, e)
            throw BadCredentialsException("Bad credentials")
        }
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        response!!.sendRedirect(redirectURL+"?code="+(authResult as AuthCodeToken).code)
    }

    override fun unsuccessfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, failed: AuthenticationException?) {
        response!!.sendRedirect("$redirectURL?code=fail")
    }
}