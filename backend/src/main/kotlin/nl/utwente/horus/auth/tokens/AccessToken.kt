package nl.utwente.horus.auth.tokens

import nl.utwente.horus.services.auth.HorusUserDetails
import org.springframework.security.core.GrantedAuthority
import java.util.*

/**
 * AccessToken is a representation of a JWT access token with potentially
 * verified user data and authorities granted to the user.
 */
class AccessToken (
        authorities: MutableCollection<out GrantedAuthority>?,
        token: String,
        id: String,
        issuer: String,
        issuedAt: Date,
        expiresAt: Date,
        userDetails: HorusUserDetails?,
        // ID of the RefreshToken that was used to grant this token
        val refreshTokenId: String
) : AbstractJWTToken(authorities, token, id, issuer, issuedAt, expiresAt, userDetails)