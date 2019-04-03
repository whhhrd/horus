package nl.utwente.horus.auth.filters

import nl.utwente.horus.auth.tokens.AccessToken
import nl.utwente.horus.auth.tokens.RefreshToken
import nl.utwente.horus.auth.util.HttpUtil
import nl.utwente.horus.services.auth.RefreshTokenService
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class LogoutFilter: OncePerRequestFilter {

    private val requestMatcher: RequestMatcher
    private val refreshTokenService: RefreshTokenService

    constructor(requestMatcher: RequestMatcher, refreshTokenService: RefreshTokenService) : super() {
        this.requestMatcher = requestMatcher
        this.refreshTokenService = refreshTokenService
    }

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        if (!requestMatcher.matches(request)) {
            filterChain.doFilter(request, response)
            return
        }

        val authentication = SecurityContextHolder.getContext().authentication

        if (authentication is RefreshToken) {
            refreshTokenService.deleteById(authentication.id)
        }

        if (authentication is AccessToken) {
            refreshTokenService.deleteById(authentication.refreshTokenId)
        }

        HttpUtil.clearClientTokenCookie(response)
        response.status = HttpStatus.OK.value()
    }
}