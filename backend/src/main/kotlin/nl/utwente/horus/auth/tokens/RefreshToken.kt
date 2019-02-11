package nl.utwente.horus.auth.tokens

import nl.utwente.horus.services.auth.HorusUserDetails
import java.util.*
import kotlin.collections.HashSet

/**
 * RefreshToken is a representation of a JWT refresh token with potentially
 * verified user data.
 */
class RefreshToken (token: String,
                    id: String,
                    issuer: String,
                    issuedAt: Date,
                    expiresAt: Date,
                    userDetails: HorusUserDetails?
) : AbstractJWTToken(HashSet(), token, id, issuer, issuedAt, expiresAt, userDetails)