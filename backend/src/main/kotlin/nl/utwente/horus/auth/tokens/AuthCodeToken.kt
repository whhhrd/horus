package nl.utwente.horus.auth.tokens

import org.springframework.security.authentication.AbstractAuthenticationToken

class AuthCodeToken(val code: String) : AbstractAuthenticationToken(HashSet()) {

    override fun getCredentials(): Any {
        return code
    }

    override fun getPrincipal(): Any? {
        return null //To change body of created functions use File | Settings | File Templates.
    }

    override fun isAuthenticated(): Boolean {
        return false
    }
}