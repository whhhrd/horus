package nl.utwente.horus.auth.util

import nl.utwente.horus.auth.filters.CLIENT_TOKEN_COOKIE_NAME
import org.springframework.web.util.WebUtils
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Provides miscellaneous utilities for working with
 * token binding 'ClientToken' cookies into HTTP requests.
 */
class HttpUtil {

    companion object {

        /**
         * Extract the ClientToken cookie from request.
         * @param request the request.
         * @return the cookie value or null if none exists.
         */
        fun extractClientTokenCookie(request: HttpServletRequest): String? {
            return WebUtils.getCookie(request, CLIENT_TOKEN_COOKIE_NAME)?.value
        }

        /**
         * Checks whether a request has the Origin HTTP header.
         * @param request the request.
         * @return Boolean indicating whether the header exists.
         */
        fun isFromOrigin(request: HttpServletRequest): Boolean {
            return !request.getHeader("Origin").isNullOrBlank()
        }

        /**
         * Generates and injects the ClientToken cookie into a request if none exists already.
         * Extends the current one otherwise.
         * @param request the request.
         * @param response the response.
         * @return the injected token.
         */
        fun injectClientTokenCookie(request: HttpServletRequest, response: HttpServletResponse): String {
            val token = extractClientTokenCookie(request) ?: RandomStringUtil.secureRandomHexString(32)
            val cookie = Cookie(CLIENT_TOKEN_COOKIE_NAME, token)
            cookie.isHttpOnly = true
            cookie.maxAge = 86400
            // If the request was made via HTTPS, the cookie MUST be sent only via HTTPS
            cookie.secure = request.isSecure
            cookie.path = "/api"
            response.addCookie(cookie)
            return token
        }

        /**
         * Clears the ClientToken cookie from a request.
         * @param response the response of the request.
         */
        fun clearClientTokenCookie(response: HttpServletResponse) {
            val cookie = Cookie(CLIENT_TOKEN_COOKIE_NAME, "")
            cookie.isHttpOnly = true
            cookie.maxAge = 0
            cookie.path = "/api"
            response.addCookie(cookie)
        }

    }

}