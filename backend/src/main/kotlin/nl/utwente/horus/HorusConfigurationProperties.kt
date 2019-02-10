package nl.utwente.horus

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.stereotype.Component
import javax.validation.constraints.NotEmpty

/**
 * Application properties
 */
@ConfigurationProperties(prefix = "horus")
@EnableConfigurationProperties
@Component
class HorusConfigurationProperties {

    // HS512 secret key for JWT signing
    @NotEmpty
    lateinit var tokenSecret: String

    // Validity duration of access tokens in seconds
    var accessTokenValidityDuration: Long = 0

    // Validity duration of refresh tokens in seconds
    var refreshTokenValidityDuration: Long = 0
}