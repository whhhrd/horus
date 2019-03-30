package nl.utwente.horus.configurations

import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.auth.filters.*
import nl.utwente.horus.auth.providers.*
import nl.utwente.horus.auth.saml.SAML2ClientHolder
import nl.utwente.horus.isProductionActive
import nl.utwente.horus.services.auth.HorusUserDetailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.authentication.configuration.EnableGlobalAuthentication
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import java.util.*

/**
 * HorusWebSecurityConfiguration configures the security filters and providers
 * required for authentication.
 */
@Configuration
@EnableGlobalAuthentication
@EnableWebSecurity
class HorusWebSecurityConfiguration: WebSecurityConfigurerAdapter() {

    companion object {
        // Path pattern to protect
        const val AUTH_PROTECTED_PATH_PATTERN = "/api/**"

        // Password login endpoint
        const val AUTH_LOGIN_PASSWORD_PATTERN = "/api/auth/login/password"

        // Auth code endpoint
        const val AUTH_LOGIN_CODE_PATTERN = "/api/auth/login/code"

        // SAML SSO request/redirect endpoint
        const val AUTH_LOGIN_SAML_REQUEST_PATTERN = "/api/auth/saml/request"

        // SAML SP metadata endpoint
        const val AUTH_LOGIN_SAML_METADATA_PATTERN = "/api/auth/saml/metadata"

        // SAML SSO response endpoint
        const val AUTH_LOGIN_SAML_RESPONSE_PATTERN = "/api/auth/saml/response"

        // Access token request endpoint
        const val AUTH_ACCESS_TOKEN_REFRESH_PATTERN = "/api/auth/token/refresh"
    }

    @Autowired
    lateinit var environment: Environment

    @Autowired
    lateinit var configurationProperties: HorusConfigurationProperties

    @Autowired
    lateinit var samlClientHolder: SAML2ClientHolder

    @Autowired
    lateinit var passwordLoginProvider: DummyPasswordLoginProvider

    @Autowired
    lateinit var jwtAuthenticationProvider: JWTAuthenticationProvider

    @Autowired
    lateinit var accessTokenRequestAuthenticationProvider: AccessTokenRequestAuthenticationProvider

    @Autowired
    lateinit var saml2SSOAuthenticationProvider: SAML2SSOAuthenticationProvider

    @Autowired
    lateinit var authCodeTokenLoginAuthenticationProvider: AuthCodeTokenLoginAuthenticationProvider

    /**
     * Register the auth providers and user detail service with the AuthenticationManager.
     */
    override fun configure(auth: AuthenticationManagerBuilder?) {
        auth!!.userDetailsService(HorusUserDetailService())
        auth.authenticationProvider(passwordLoginProvider)
        auth.authenticationProvider(jwtAuthenticationProvider)
        auth.authenticationProvider(accessTokenRequestAuthenticationProvider)
        auth.authenticationProvider(saml2SSOAuthenticationProvider)
        auth.authenticationProvider(authCodeTokenLoginAuthenticationProvider)
    }

    /**
     * Initialize the password authentication filter with the proper endpoint path pattern.
     */
    private fun buildPasswordAuthenticationFilter(): PasswordLoginAuthenticationFilter {
        val filter = PasswordLoginAuthenticationFilter(AntPathRequestMatcher(AUTH_LOGIN_PASSWORD_PATTERN))
        filter.setAuthenticationManager(authenticationManager())
        return filter
    }

    /**
     * Initialize the SAML SP metadata provision filter with the proper path pattern.
     */
    private fun buildSAMLMetadataFilter(): SAML2MetadataProviderFilter {
        return SAML2MetadataProviderFilter(AntPathRequestMatcher(AUTH_LOGIN_SAML_METADATA_PATTERN), samlClientHolder.getClient())
    }

    /**
     * Initializes the SAML authentication request redirect filter with the proper path pattern.
     */
    private fun buildSAMLAuthnRequestRedirectFilter(): SAML2SSOAuthenticationRequestRedirectFilter {
        return SAML2SSOAuthenticationRequestRedirectFilter(AntPathRequestMatcher(AUTH_LOGIN_SAML_REQUEST_PATTERN), samlClientHolder.getClient())
    }

    /**
     * Initializes the SAML authentication response authentication filter with the proper path pattern.
     */
    private fun buildSAMLAuthResponseAuthenticationFilter(): SAML2SSOAuthenticationResponseAuthenticationFilter {
        val filter = SAML2SSOAuthenticationResponseAuthenticationFilter(AntPathRequestMatcher(AUTH_LOGIN_SAML_RESPONSE_PATTERN), samlClientHolder.getClient(), configurationProperties.authCodeRedirectURL)
        filter.setAuthenticationManager(authenticationManager())
        return filter
    }

    /**
     * Initializes the authentication code based authentication filter with the proper path pattern.
     */
    private fun buildAuthCodeLoginAuthenticationFilter(): AuthCodeLoginAuthenticationFilter {
        val filter = AuthCodeLoginAuthenticationFilter(AntPathRequestMatcher(AUTH_LOGIN_CODE_PATTERN))
        filter.setAuthenticationManager(authenticationManager())
        return filter
    }

    /**
     * Initialize the JWT authentication filter with the proper path pattern.
     */
    private fun buildJWTAuthenticationFilter(): JWTAuthenticationFilter {
        val filter = JWTAuthenticationFilter(AntPathRequestMatcher(AUTH_PROTECTED_PATH_PATTERN))
        filter.setAuthenticationManager(authenticationManager())
        return filter
    }

    /**
     * Initialize the access token request authentication with the proper endpoint path pattern.
     */
    private fun buildAccessTokenRequestAuthenticationFilter(): AccessTokenRequestAuthenticationFilter {
        val filter = AccessTokenRequestAuthenticationFilter(AntPathRequestMatcher(AUTH_ACCESS_TOKEN_REFRESH_PATTERN))
        filter.setAuthenticationManager(authenticationManager())
        return filter
    }

    /**
     * Initialize the access token checking filter.
     */
    private fun buildEnsureAccessTokenAuthenticationFilter(): EnsureAccessTokenAuthenticationFilter {
        return EnsureAccessTokenAuthenticationFilter(AntPathRequestMatcher(AUTH_PROTECTED_PATH_PATTERN))
    }



    /**
     * Build the CORS filter with a configuration to allow requests with different origins.
     */
    protected fun buildCorsFilter(): CorsFilter {
        val config = CorsConfiguration()
        // Allow sending credentials
        config.allowCredentials = true
        // Any origin
        config.addAllowedOrigin("*")
        // All headers
        config.addAllowedHeader("*")
        config.maxAge = 36000L
        config.allowedMethods = Arrays.asList("GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS")
        val source = UrlBasedCorsConfigurationSource()
        // Allow for all paths
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }


    /**
     * Configure the security settings and filter chain.
     */
    override fun configure(http: HttpSecurity?) {
        // Disable CSRF; we don't use cookies or sessions
        http!!.csrf().disable()
        // Enable and initialize the SecurityContext support for storing
        // authentication in requests
        http.securityContext()
        // Disable anonymous user representation
        http.anonymous().disable()
        // Allow configuring exception handling
        http.exceptionHandling()
        // Not sure if this is required, but it adds the Security headers to the response
        http.headers()
        // Disable caching pages and redirecting after authentication
        http.requestCache().disable()

        // Build filter config; start with the CORS filter
        http.addFilter(buildCorsFilter())
                // Add SAML metadata provision filter, this will intercept and return SP metadata
                .addFilterAfter(buildSAMLMetadataFilter(), CorsFilter::class.java)
                .addFilterAfter(buildSAMLAuthnRequestRedirectFilter(), SAML2MetadataProviderFilter::class.java)
                .addFilterAfter(buildSAMLAuthResponseAuthenticationFilter(), SAML2SSOAuthenticationRequestRedirectFilter::class.java)
                .addFilterAfter(buildAuthCodeLoginAuthenticationFilter(), SAML2SSOAuthenticationResponseAuthenticationFilter::class.java)

        // Add JWT auth filter, this will intercept, authenticate and continue the filter chain if authenticated
        // However, add external login before this if we're not in production
        if (!environment.isProductionActive()) {
            // First add password auth filter, this will intercept and handle request if path matches
            http.addFilterAfter(buildPasswordAuthenticationFilter(), AuthCodeLoginAuthenticationFilter::class.java)
                    .addFilterAfter(buildJWTAuthenticationFilter(), PasswordLoginAuthenticationFilter::class.java)
        } else {
            http.addFilterAfter(buildJWTAuthenticationFilter(), AuthCodeLoginAuthenticationFilter::class.java)
        }
                // Add access token request filter, this will check if path matches and respond with an access token if
                // a refresh token is in the SecurityContext
                .addFilterAfter(buildAccessTokenRequestAuthenticationFilter(), JWTAuthenticationFilter::class.java)
                // Beyond this point, ensure that ony requests with an AccessToken may pass through
                .addFilterAfter(buildEnsureAccessTokenAuthenticationFilter(), AccessTokenRequestAuthenticationFilter::class.java)
                // Disable sessions (REST FTW!!!)
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}