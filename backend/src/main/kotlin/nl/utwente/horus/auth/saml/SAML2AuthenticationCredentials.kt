package nl.utwente.horus.auth.saml

import nl.utwente.horus.services.auth.HorusUserDetails
import org.pac4j.saml.credentials.SAML2Credentials
import org.springframework.security.authentication.AbstractAuthenticationToken

class SAML2AuthenticationCredentials (

        val credentials: SAML2Credentials,

        val userId: String,

        val mail: String,

        val surName: String,

        val givenName: String

): AbstractAuthenticationToken(emptySet()) {

    var userDetails: HorusUserDetails? = null

    override fun getCredentials(): Any {
        return credentials
    }

    override fun getPrincipal(): Any? {
        return userDetails
    }
}