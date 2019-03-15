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
            var person = personService.getPersonByLoginId(authentication.userId)
            if (person == null) {
                // Create Person instance
                person = personService.createPerson(
                        authentication.userId,
                        authentication.givenName + " " + authentication.surName,
                        authentication.givenName,
                        // "Recreated" sortable name, will be replaced by real value when importing from Canvas.
                        authentication.surName + ", " + authentication.givenName,
                        authentication.mail
                )
            } else {
                // Update existing with correct shortName if not updated yet
                // Only do update if really different: don't want to cause
                // unnecessary DB writes since login is used often.
                if (person.shortName != authentication.givenName) {
                    person.shortName = authentication.givenName
                }
            }
            return tokenFactory.generateAuthCodeToken(person)
        }
        throw BadCredentialsException("Invalid credentials")
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return SAML2AuthenticationCredentials::class.java.isAssignableFrom(authentication)
    }
}