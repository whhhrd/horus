package nl.utwente.horus.representations.auth

import com.fasterxml.jackson.annotation.JsonProperty

data class PasswordLoginRequest (
        @JsonProperty("username")
        val username: String,

        @JsonProperty("password")
        val password: String
)