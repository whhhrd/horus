package nl.utwente.horus.auth.providers

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.services.auth.HorusUserDetails
import nl.utwente.horus.auth.tokens.*
import nl.utwente.horus.auth.util.JWTUtil
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.lang.Exception

/**
 * JWTAuthenticationProvider authenticates a RawToken (unauthenticated token string),
 * and builds the authenticated RefreshToken or AccessToken object.
 */
@Component
@Transactional
class JWTAuthenticationProvider: AuthenticationProvider {

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var configurationProperties: HorusConfigurationProperties

    override fun authenticate(authentication: Authentication?): Authentication {
        // Check if authentication is a RawToken
        if (authentication !is RawToken) {
            throw BadCredentialsException("Invalid token data")
        }

        // Deserialize and validate signature and expiry of JWT string
        val jws: Jws<Claims>
        try {
            jws = JWTUtil.verifyTokenString(authentication.token, configurationProperties.tokenSecret)
        } catch (e: Exception) {
            throw BadCredentialsException("Invalid token")
        }

        // Check token type header
        val typeStr = jws.header[JWTUtil.TOKEN_TYPE_HEADER_TAG]
        if (typeStr == null || typeStr !is String || !(TokenType.values().map { t -> t.name }).contains(typeStr)) {
            throw BadCredentialsException("Invalid token type")
        }

        val body = jws.body

        // Get the person for the token and set this in the token object
        val person = personService.getPersonById(body.subject.toLong())

        val token: AbstractJWTToken

        // Build the actual token objects
        val type = TokenType.valueOf(typeStr)
        when(type) {
            TokenType.ACCESS_TOKEN -> {
                token = AccessToken(
                        person.getAuthorities(),
                        authentication.token,
                        body.id,
                        body.issuer,
                        body.issuedAt,
                        body.expiration,
                        HorusUserDetails(person),
                        body[JWTUtil.REFRESH_TOKEN_ID_CLAIM] as String)
            }
            TokenType.REFRESH_TOKEN -> {
                token = RefreshToken(
                        authentication.token,
                        body.id,
                        body.issuer,
                        body.issuedAt,
                        body.expiration,
                        HorusUserDetails(person))
            }
        }



        return token
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return RawToken::class.java.isAssignableFrom(authentication)
    }
}