package nl.utwente.horus.auth.providers

import nl.utwente.horus.auth.tokens.AuthCodeToken
import nl.utwente.horus.auth.tokens.TokenFactory
import nl.utwente.horus.services.auth.AuthCodeService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.ZonedDateTime

/**
 * AuthCodeTokenLoginAuthenticationProvider authenticates an AuthCodeToken to grant an AccessToken and RefreshToken.
 */
@Component
@Transactional
class AuthCodeTokenLoginAuthenticationProvider: AuthenticationProvider {

    @Autowired
    private lateinit var tokenFactory: TokenFactory

    @Autowired
    private lateinit var authCodeService: AuthCodeService

    companion object {
        val AUTH_CODE_EXPIRY_DURATION = Duration.ofMinutes(5)
    }

    override fun authenticate(authentication: Authentication?): Authentication {
        // Check whether an AuthCodeToken is present and valid
        if (authentication is AuthCodeToken) {
            val code = authCodeService.getAuthCodeByCode(authentication.code) ?: throw BadCredentialsException("Invalid auth code")
            if ((code.createdAt + AUTH_CODE_EXPIRY_DURATION).isBefore(ZonedDateTime.now())) {
                throw BadCredentialsException("Invalid auth code")
            }
            authCodeService.deleteAuthCode(code)
            return tokenFactory.generateTokenPair(code.person, authentication.clientId)
        }
        throw BadCredentialsException("Auth code token required")
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return AuthCodeToken::class.java.isAssignableFrom(authentication)
    }

}