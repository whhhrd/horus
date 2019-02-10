package nl.utwente.horus.auth.providers

import nl.utwente.horus.auth.tokens.TokenFactory
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * DummyPasswordLoginProvider provides username/password authentication support.
 * UsernamePasswordAuthenticationToken (username/password pair) is authenticated to
 * provide a new RefreshToken. This is a dummy provider which does no real authenication
 * beyond checking whether the user exists and the password is "password"
 */
@Component
@Transactional
class DummyPasswordLoginProvider: AuthenticationProvider {

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var tokenFactory: TokenFactory

    override fun authenticate(authentication: Authentication?): Authentication {
        if (authentication is UsernamePasswordAuthenticationToken) {
            // Check if password is "password"
            if (authentication.credentials != "password") {
                authentication.eraseCredentials()
                throw BadCredentialsException("Invalid credentials")
            }
            // Fetch the person and create a RefreshToken
            val person = personService.getPersonByLoginId(authentication.name) ?: throw BadCredentialsException("Invalid credentials")
            return tokenFactory.generateRefreshToken(person)
        }
        throw BadCredentialsException("Invalid credentials")
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return UsernamePasswordAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

}