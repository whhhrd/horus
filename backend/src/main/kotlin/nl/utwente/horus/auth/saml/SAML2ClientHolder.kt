package nl.utwente.horus.auth.saml

import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.configurations.HorusWebSecurityConfiguration
import org.pac4j.saml.client.SAML2Client
import org.pac4j.saml.config.SAML2Configuration
import org.springframework.beans.factory.InitializingBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class SAML2ClientHolder: InitializingBean {

    private var saml2Client: SAML2Client? = null

    @Autowired
    lateinit var configurationProperties: HorusConfigurationProperties

    fun getClient(): SAML2Client {
        return saml2Client!!
    }

    override fun afterPropertiesSet() {
        val configuration = SAML2Configuration(configurationProperties.samlKeyStorePath, configurationProperties.samlKeyStorePassword, configurationProperties.samlPrivateKeyPassword, configurationProperties.samlIdPMetadataLocation)
        configuration.serviceProviderEntityId = configurationProperties.samlServiceProviderEntityId
        saml2Client = SAML2Client(configuration)
        saml2Client!!.callbackUrl = configurationProperties.applicationBaseURL+HorusWebSecurityConfiguration.AUTH_LOGIN_SAML_RESPONSE_PATTERN
        saml2Client!!.init()
    }
}