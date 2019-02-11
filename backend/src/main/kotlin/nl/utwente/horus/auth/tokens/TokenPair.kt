package nl.utwente.horus.auth.tokens

/**
 * AccessToken is a representation of a JWT access token with potentially
 * verified user data and authorities granted to the user.
 */
data class TokenPair(
        val accessToken: AccessToken,
        val refreshToken: RefreshToken
) : AbstractJWTToken(accessToken.authorities, accessToken.token, accessToken.id, accessToken.issuer,
        accessToken.issuedAt, accessToken.expiresAt, accessToken.userDetails)