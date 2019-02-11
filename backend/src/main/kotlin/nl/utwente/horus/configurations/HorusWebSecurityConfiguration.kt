package nl.utwente.horus.configurations

import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.auth.filters.AccessTokenRequestAuthenticationFilter
import nl.utwente.horus.auth.filters.EnsureAccessTokenAuthenticationFilter
import nl.utwente.horus.auth.filters.JWTAuthenticationFilter
import nl.utwente.horus.auth.filters.PasswordLoginAuthenticationFilter
import nl.utwente.horus.auth.providers.AccessTokenRequestAuthenticationProvider
import nl.utwente.horus.auth.providers.JWTAuthenticationProvider
import nl.utwente.horus.auth.providers.DummyPasswordLoginProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
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

        // Access token request endpoint
        const val AUTH_ACCESS_TOKEN_REFRESH_PATTERN = "/api/auth/token/refresh"
    }

    @Autowired
    lateinit var passwordLoginProvider: DummyPasswordLoginProvider

    @Autowired
    lateinit var jwtAuthenticationProvider: JWTAuthenticationProvider

    @Autowired
    lateinit var accessTokenRequestAuthenticationProvider: AccessTokenRequestAuthenticationProvider

    /**
     * Register the auth providers and user detail service with the AuthenticationManager.
     */
    override fun configure(auth: AuthenticationManagerBuilder?) {
        auth!!.userDetailsService(HorusUserDetailService())
        auth.authenticationProvider(passwordLoginProvider)
        auth.authenticationProvider(jwtAuthenticationProvider)
        auth.authenticationProvider(accessTokenRequestAuthenticationProvider)
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
                // Add password auth filter, this will intercept and handle request if path matches
                .addFilterAfter(buildPasswordAuthenticationFilter(), CorsFilter::class.java)
                // Add JWT auth filter, this will intercept, authenticate and continue the filter chain if authenticated
                .addFilterAfter(buildJWTAuthenticationFilter(), PasswordLoginAuthenticationFilter::class.java)
                // Add access token request filter, this will check if path matches and respond with an access token if
                // a refresh token is in the SecurityContext
                .addFilterAfter(buildAccessTokenRequestAuthenticationFilter(), JWTAuthenticationFilter::class.java)
                // Beyond this point, ensure that ony requests with an AccessToken may pass through
                .addFilterAfter(buildEnsureAccessTokenAuthenticationFilter(), AccessTokenRequestAuthenticationFilter::class.java)
                // Disable sessions (REST FTW!!!)
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}