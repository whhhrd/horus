package nl.utwente.horus.auth.tokens

import nl.utwente.horus.services.auth.HorusUserDetails
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import java.util.*

/**
 * AbstractJWTToken is an abstract JWT token with user data.
 */
abstract class AbstractJWTToken (
        authorities: MutableCollection<out GrantedAuthority>?,
        val token: String,
        val id: String,
        val issuer: String,
        val issuedAt: Date,
        val expiresAt: Date,
        var userDetails: HorusUserDetails?) : AbstractAuthenticationToken(authorities) {

    override fun getCredentials(): Any? {
        return token
    }

    override fun getPrincipal(): Any? {
        return userDetails
    }

    override fun isAuthenticated(): Boolean {
        return expiresAt.after(Date()) && userDetails != null
    }

}