package nl.utwente.horus.auth.util

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import nl.utwente.horus.auth.tokens.AccessToken
import nl.utwente.horus.auth.tokens.RefreshToken
import nl.utwente.horus.auth.tokens.TokenPair
import nl.utwente.horus.auth.tokens.TokenType
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.services.auth.HorusUserDetails
import java.time.Duration
import java.util.*
import javax.crypto.SecretKey

/**
 * JWTUtil is a utility class to generate and verify JWTs.
 */
class JWTUtil {
    companion object {
        const val DEFAULT_TOKEN_ISSUER = "horus"
        const val TOKEN_TYPE_HEADER_TAG = "type"
        const val REFRESH_TOKEN_ID_CLAIM = "rtid"

        /**
         * Parse a Base64 encoded HS512 key.
         */
        private fun parseSecretKeyBase64(secretKey: String): SecretKey {
            return Keys.hmacShaKeyFor(Base64.getUrlDecoder().decode(secretKey))
        }

        fun buildTokenPair(person: Person, secretKey: String, accessValidityDuration: Long, refreshValidityDuration: Long): TokenPair {
            val refresh = buildRefreshToken(person, secretKey, refreshValidityDuration)
            val access = buildAccessToken(person, refresh, secretKey, accessValidityDuration)
            return TokenPair(access, refresh)
        }

        /**
         * Build and sign a RefreshToken for the given Person.
         */
        fun buildRefreshToken(person: Person, secretKey: String, validityDuration: Long): RefreshToken {
            val key = parseSecretKeyBase64(secretKey)
            val claims = buildTokenClaims(person, validityDuration)

            val builder = Jwts.builder()
            builder.setHeaderParam(TOKEN_TYPE_HEADER_TAG, TokenType.REFRESH_TOKEN)
            builder.setClaims(claims)

            return RefreshToken(builder.signWith(key).compact(), claims.id, DEFAULT_TOKEN_ISSUER, claims.issuedAt, claims.expiration, HorusUserDetails(person))
        }

        /**
         * Build and sign an AccessToken for the given Person, based on the given RefreshToken.
         */

        fun buildAccessToken(person: Person, refreshToken: RefreshToken, secretKey: String, validityDuration: Long): AccessToken {
            val key = parseSecretKeyBase64(secretKey)
            val claims = buildTokenClaims(person, validityDuration)

            claims[REFRESH_TOKEN_ID_CLAIM] =  refreshToken.id
            val builder = Jwts.builder()
            builder.setHeaderParam(TOKEN_TYPE_HEADER_TAG, TokenType.ACCESS_TOKEN)
            builder.setClaims(claims)

            return AccessToken(HashSet(), builder.signWith(key).compact(), claims.id, DEFAULT_TOKEN_ISSUER, claims.issuedAt, claims.expiration, HorusUserDetails(person), refreshToken.id)
        }

        /**
         * Build a JWT Claims for the Person, with the given validity duration in seconds.
         */
        private fun buildTokenClaims(person: Person, validityDuration: Long): Claims {
            val claims = Jwts.claims()
            claims.id = UUID.randomUUID().toString()
            claims.subject = person.id.toString()
            val now = Date()
            claims.issuedAt = now
            claims.issuer = DEFAULT_TOKEN_ISSUER
            val expiry = Date.from(now.toInstant().plusNanos(Duration.ofSeconds(validityDuration).toNanos()))
            claims.expiration = expiry

            return claims
        }

        /**
         * Verify an encoded JWT token string with the given key and check if issuer matches.
         */
        fun verifyTokenString(token: String, secretKey: String): Jws<Claims> {
            val key = parseSecretKeyBase64(secretKey)
            return Jwts.parser().requireIssuer(DEFAULT_TOKEN_ISSUER).setSigningKey(key).parseClaimsJws(token)
        }
    }
}