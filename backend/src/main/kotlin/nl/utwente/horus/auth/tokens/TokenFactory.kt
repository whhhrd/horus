package nl.utwente.horus.auth.tokens

import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.auth.util.JWTUtil
import nl.utwente.horus.auth.util.RandomStringUtil
import nl.utwente.horus.entities.auth.AuthCode
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.services.auth.AuthCodeService
import nl.utwente.horus.services.auth.RefreshTokenService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.codec.Hex
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

/**
 * TokenFactory generates tokens based on configuration data using the JWTUtil helper class.
 */
@Component
@Transactional
class TokenFactory {

    @Autowired
    private lateinit var configurationProperties: HorusConfigurationProperties

    @Autowired
    private lateinit var authCodeService: AuthCodeService

    @Autowired
    private lateinit var refreshTokenService: RefreshTokenService

    fun generateTokenPair(person: Person, clientId: String?) : TokenPair {
        val tokenPair = JWTUtil.buildTokenPair(person, configurationProperties.tokenSecret, configurationProperties.accessTokenValidityDuration, configurationProperties.refreshTokenValidityDuration)
        persistRefreshToken(person, clientId, tokenPair.refreshToken)
        return tokenPair
    }

    fun generateRefreshToken(person: Person, clientId: String?): RefreshToken {
        val refreshToken = JWTUtil.buildRefreshToken(person, configurationProperties.tokenSecret, configurationProperties.refreshTokenValidityDuration)
        persistRefreshToken(person, clientId, refreshToken)
        return refreshToken
    }

    fun generateAccessToken(person: Person, refreshToken: RefreshToken): AccessToken {
        return JWTUtil.buildAccessToken(person, refreshToken, configurationProperties.tokenSecret, configurationProperties.accessTokenValidityDuration)
    }

    fun generateAuthCodeToken(person: Person): AuthCodeToken {
        val code = authCodeService.createAuthCode(RandomStringUtil.secureRandomHexString(128), person)
        return AuthCodeToken(code.code, null)
    }

    private fun persistRefreshToken(person: Person, clientId: String?, refreshToken: RefreshToken) {
        refreshTokenService.saveNew(refreshToken.id, person, clientId, ZonedDateTime.ofInstant(refreshToken.issuedAt.toInstant(), ZoneId.systemDefault()), ZonedDateTime.ofInstant(refreshToken.expiresAt.toInstant(), ZoneId.systemDefault()))
    }
}