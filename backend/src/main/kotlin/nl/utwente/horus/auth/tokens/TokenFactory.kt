package nl.utwente.horus.auth.tokens

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.auth.util.JWTUtil
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.transaction.Transactional

/**
 * TokenFactory generates tokens based on configuration data using the JWTUtil helper class.
 */
@Component
@Transactional
class TokenFactory {

    @Autowired
    lateinit var configurationProperties: HorusConfigurationProperties

    fun generateRefreshToken(person: Person): RefreshToken {
        return JWTUtil.buildRefreshToken(person, configurationProperties.tokenSecret, configurationProperties.refreshTokenValidityDuration)
    }

    fun generateAccessToken(person: Person, refreshToken: RefreshToken): AccessToken {
        return JWTUtil.buildAccessToken(person, refreshToken, configurationProperties.tokenSecret, configurationProperties.accessTokenValidityDuration)
    }

}