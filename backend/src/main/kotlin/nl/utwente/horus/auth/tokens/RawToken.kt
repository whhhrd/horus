package nl.utwente.horus.auth.tokens

import org.springframework.security.authentication.AbstractAuthenticationToken

/**
 * RawToken is a container for a raw, unverified token string.
 */
class RawToken(val token: String) : AbstractAuthenticationToken(HashSet()) {

    override fun getCredentials(): Any {
        return token
    }

    override fun getPrincipal(): Any? {
        return null
    }

    override fun isAuthenticated(): Boolean {
        return false
    }
}