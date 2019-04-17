package nl.utwente.horus.auth

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.auth.providers.*
import nl.utwente.horus.auth.tokens.*
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.BadCredentialsException

class AuthenticationProviderTest: HorusAbstractTest() {

    @Autowired
    private lateinit var dummyPasswordLoginProvider: DummyPasswordLoginProvider

    @Autowired
    private lateinit var jwtAuthenticationProvider: JWTAuthenticationProvider

    @Autowired
    private lateinit var accessTokenRequestAuthenticationProvider: AccessTokenRequestAuthenticationProvider

    @Autowired
    private lateinit var authCodeTokenLoginAuthenticationProvider: AuthCodeTokenLoginAuthenticationProvider

    @Autowired
    private lateinit var saml2SsoAuthenticationProvider: SAML2SSOAuthenticationProvider

    @Autowired
    private lateinit var personService: PersonService

    @Autowired
    private lateinit var tokenFactory: TokenFactory

    @Test
    fun testDummyPasswordAuthenticationFailure() {
        generateTokenPair()
    }

    @Test
    fun testDummyPasswordAuthenticationSuccess() {
        val credentials = UsernamePasswordToken(PP_STUDENT_LOGIN, "incorrect", null);
        assertThrows(BadCredentialsException::class) {
            dummyPasswordLoginProvider.authenticate(credentials)
        }
    }

    @Test
    fun testRefreshTokenAuthenticationSuccess() {
        val tokenPair = generateTokenPair()
        val rawToken = RawToken(tokenPair.refreshToken.token, null)
        val refreshToken = jwtAuthenticationProvider.authenticate(rawToken) as RefreshToken
        val accessToken = accessTokenRequestAuthenticationProvider.authenticate(refreshToken) as AccessToken
        Assert.assertEquals(refreshToken.id, accessToken.refreshTokenId)
        Assert.assertEquals(PP_STUDENT_LOGIN, refreshToken.userDetails?.person?.loginId)
    }

    @Test
    fun testRefreshTokenAuthenticationFailure() {
        val tokenPair = generateTokenPair()
        val rawToken = RawToken(tokenPair.refreshToken.token + "4", null)
        assertThrows(BadCredentialsException::class) {
            jwtAuthenticationProvider.authenticate(rawToken)
        }
    }

    @Test
    fun testAccessTokenAuthenticationSuccess() {
        val tokenPair = generateTokenPair()
        val rawToken = RawToken(tokenPair.accessToken.token, null)
        val accessToken = jwtAuthenticationProvider.authenticate(rawToken) as AccessToken
        Assert.assertEquals(PP_STUDENT_LOGIN, accessToken.userDetails?.person?.loginId)
    }

    @Test
    fun testAccessTokenAuthenticationFailure() {
        val tokenPair = generateTokenPair()
        val rawToken = RawToken(tokenPair.accessToken.token + "4", null)
        assertThrows(BadCredentialsException::class) {
            jwtAuthenticationProvider.authenticate(rawToken)
        }
    }

    @Test
    fun testTokenBinding() {
        val clientId = "correctclientid"
        val tokenPair = generateTokenPair(clientId)
        jwtAuthenticationProvider.authenticate(RawToken(tokenPair.refreshToken.token, clientId)) as RefreshToken
        assertThrows(BadCredentialsException::class) {
            jwtAuthenticationProvider.authenticate(RawToken(tokenPair.refreshToken.token, clientId + "1"))
        }
    }

    @Test
    fun testAuthCodeSuccess() {
        val authCodeStr = generateAuthCode().code
        val authCode = AuthCodeToken(authCodeStr, null)
        val tokenPair = authCodeTokenLoginAuthenticationProvider.authenticate(authCode) as TokenPair
        Assert.assertEquals(PP_STUDENT_LOGIN, tokenPair.refreshToken.userDetails?.person?.loginId)
    }

    @Test
    fun testAuthCodeInvalidFailure() {
        val authCodeStr = generateAuthCode().code + "a"
        val authCode = AuthCodeToken(authCodeStr, null)
        assertThrows(BadCredentialsException::class) {
            authCodeTokenLoginAuthenticationProvider.authenticate(authCode)
        }
    }

    @Test
    fun testAuthCodeUsedFailure() {
        val authCodeStr = generateAuthCode().code
        val authCode = AuthCodeToken(authCodeStr, null)
        val tokenPair = authCodeTokenLoginAuthenticationProvider.authenticate(authCode) as TokenPair
        Assert.assertEquals(PP_STUDENT_LOGIN, tokenPair.refreshToken.userDetails?.person?.loginId)
        assertThrows(BadCredentialsException::class) {
            authCodeTokenLoginAuthenticationProvider.authenticate(authCode)
        }
    }

    private fun generateTokenPair(clientId: String? = null): TokenPair {
        val credentials = UsernamePasswordToken(PP_STUDENT_LOGIN, DummyPasswordLoginProvider.DUMMY_PASSWORD, clientId)
        return dummyPasswordLoginProvider.authenticate(credentials) as TokenPair
    }

    private fun generateAuthCode(clientId: String? = null): AuthCodeToken {
        val person = personService.getPersonByLoginId(PP_STUDENT_LOGIN)!!
        return tokenFactory.generateAuthCodeToken(person)
    }

}