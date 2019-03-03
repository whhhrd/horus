package nl.utwente.horus.auth.saml

import nl.utwente.horus.auth.util.SAML2Util
import org.pac4j.saml.credentials.SAML2Credentials
import org.springframework.security.authentication.BadCredentialsException

class SAML2AttributeExtractor {

    val scheme: SAML2AttributeExtractionScheme

    constructor(scheme: SAML2AttributeExtractionScheme) {
        this.scheme = scheme
    }

    fun extractSAMLCredentialsToAuthCredentials(credentials: SAML2Credentials): SAML2AuthenticationCredentials {
        val map = SAML2Util.credentialAttributesToMap(credentials.attributes)
        return SAML2AuthenticationCredentials(
                credentials,
                map[scheme.getUserIdAttributeName()] ?: throw BadCredentialsException("userId unavailable"),
                map[scheme.getMailAttributeName()] ?: throw BadCredentialsException("mail unavailable"),
                map[scheme.getSurNameAttributeName()] ?: throw BadCredentialsException("surname unavailable"),
                map[scheme.getGivenNameAttributeName()] ?: throw BadCredentialsException("given name unavailable")
        )
    }
}