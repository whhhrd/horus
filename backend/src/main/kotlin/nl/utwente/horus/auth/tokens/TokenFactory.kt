package nl.utwente.horus.auth.tokens

import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.auth.util.JWTUtil
import nl.utwente.horus.entities.auth.AuthCode
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.services.auth.AuthCodeService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.codec.Hex
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
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

    fun generateTokenpair(person: Person) : TokenPair {
        return JWTUtil.buildTokenPair(person, configurationProperties.tokenSecret, configurationProperties.accessTokenValidityDuration, configurationProperties.refreshTokenValidityDuration)
    }

    fun generateRefreshToken(person: Person): RefreshToken {
        return JWTUtil.buildRefreshToken(person, configurationProperties.tokenSecret, configurationProperties.refreshTokenValidityDuration)
    }

    fun generateAccessToken(person: Person, refreshToken: RefreshToken): AccessToken {
        return JWTUtil.buildAccessToken(person, refreshToken, configurationProperties.tokenSecret, configurationProperties.accessTokenValidityDuration)
    }

    fun generateAuthCodeToken(person: Person): AuthCodeToken {
        val bytes = ByteArray(128)
        SecureRandom.getInstance("SHA1PRNG").nextBytes(bytes)
        val code = authCodeService.createAuthCode(String(Hex.encode(bytes)), person)
        return AuthCodeToken(code.code)
    }

}