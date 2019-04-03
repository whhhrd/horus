package nl.utwente.horus.auth.util

import nl.utwente.horus.auth.filters.CLIENT_TOKEN_COOKIE_NAME
import org.springframework.web.util.WebUtils
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class HttpUtil {

    companion object {

        fun extractClientTokenCookie(request: HttpServletRequest): String? {
            return WebUtils.getCookie(request, CLIENT_TOKEN_COOKIE_NAME)?.value
        }

        fun isFromOrigin(request: HttpServletRequest): Boolean {
            return !request.getHeader("Origin").isNullOrBlank()
        }

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

        fun clearClientTokenCookie(response: HttpServletResponse) {
            val cookie = Cookie(CLIENT_TOKEN_COOKIE_NAME, "")
            cookie.isHttpOnly = true
            cookie.maxAge = 0
            cookie.path = "/api"
            response.addCookie(cookie)
        }

    }

}