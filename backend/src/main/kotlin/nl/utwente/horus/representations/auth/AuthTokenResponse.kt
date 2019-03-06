package nl.utwente.horus.representations.auth

data class AuthTokenResponse (
        val accessToken: String?,

        val refreshToken: String?,

        val authorities: List<HorusAuthorityDto>
)