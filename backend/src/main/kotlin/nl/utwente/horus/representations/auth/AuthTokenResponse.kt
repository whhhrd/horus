package nl.utwente.horus.representations.auth

import com.fasterxml.jackson.annotation.JsonProperty

data class AuthTokenResponse (
        @JsonProperty("accessToken")
        val accessToken: String?,

        @JsonProperty("refreshToken")
        val refreshToken: String?
)