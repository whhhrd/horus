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

    // Scheme of application URL (http/https)
    lateinit var applicationScheme: String

    // External URL host:port of application
    lateinit var applicationHost: String

    // URL for redirect with an authentication code
    lateinit var authCodeRedirectURL: String

    // SAML SP Entity ID
    lateinit var samlServiceProviderEntityId: String

    // Path to SAML key store
    lateinit var samlKeyStorePath: String

    // Password for SAML key store
    lateinit var samlKeyStorePassword: String

    // Password for SAML private key
    lateinit var samlPrivateKeyPassword: String

    // Location of SAML Identity Provider metadata
    lateinit var samlIdPMetadataLocation: String

    val applicationBaseURL: String
        get() = "$applicationScheme://$applicationHost"
}