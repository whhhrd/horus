package nl.utwente.horus.auth.tokens

import org.springframework.security.authentication.AbstractAuthenticationToken

/**
 * UsernamePasswordToken is a representation of username/password
 * credentials as an AbstractAuthenticationToken.
 */
class UsernamePasswordToken(val username: String, val password: String,val clientId: String?) : AbstractAuthenticationToken(HashSet()) {

    override fun getCredentials(): String {
        return password
    }

    override fun getPrincipal(): String {
        return username
    }

    override fun isAuthenticated(): Boolean {
        return false
    }
}