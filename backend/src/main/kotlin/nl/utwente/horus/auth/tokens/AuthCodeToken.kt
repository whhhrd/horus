package nl.utwente.horus.auth.tokens

import org.springframework.security.authentication.AbstractAuthenticationToken

/**
 * AuthCodeToken is a representation of a single-use authentication code as an
 * AbstractAuthenticationToken.
 */
class AuthCodeToken(val code: String, val clientId: String?) : AbstractAuthenticationToken(HashSet()) {

    override fun getCredentials(): Any {
        return code
    }

    override fun getPrincipal(): Any? {
        return null
    }

    override fun isAuthenticated(): Boolean {
        return false
    }
}