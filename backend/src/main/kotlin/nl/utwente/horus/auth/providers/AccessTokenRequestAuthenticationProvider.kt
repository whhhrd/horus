package nl.utwente.horus.auth.providers

import nl.utwente.horus.auth.tokens.RefreshToken
import nl.utwente.horus.auth.tokens.TokenFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import javax.transaction.Transactional

/**
 * AccessTokenRequestAuthenticationProvider authenticates a RefreshToken to grant an AccessToken.
 */
@Component
@Transactional
class AccessTokenRequestAuthenticationProvider: AuthenticationProvider {

    @Autowired
    lateinit var tokenFactory: TokenFactory

    override fun authenticate(authentication: Authentication?): Authentication {
        // Check whether a RefreshToken is present and valid
        if (authentication is RefreshToken && authentication.isAuthenticated) {
            // Create AccessToken for same user and return
            return tokenFactory.generateAccessToken(authentication.userDetails!!.person, authentication)
        }
        throw BadCredentialsException("Refresh token required")
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return RefreshToken::class.java.isAssignableFrom(authentication)
    }

}