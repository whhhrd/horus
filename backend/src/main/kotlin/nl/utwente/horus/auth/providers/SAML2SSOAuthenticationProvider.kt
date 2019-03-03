package nl.utwente.horus.auth.providers

import nl.utwente.horus.auth.saml.SAML2AuthenticationCredentials
import nl.utwente.horus.auth.tokens.TokenFactory
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class SAML2SSOAuthenticationProvider: AuthenticationProvider {

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var tokenFactory: TokenFactory

    override fun authenticate(authentication: Authentication?): Authentication {
        if (authentication is SAML2AuthenticationCredentials) {
            // Fetch the person and create a RefreshToken
            val person = personService.getPersonByLoginId(authentication.userId) ?:
            personService.createPerson(
                    authentication.userId,
                    authentication.givenName + " " + authentication.surName,
                    authentication.givenName,
                    authentication.mail
            )
            return tokenFactory.generateAuthCodeToken(person)
        }
        throw BadCredentialsException("Invalid credentials")
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return SAML2AuthenticationCredentials::class.java.isAssignableFrom(authentication)
    }
}