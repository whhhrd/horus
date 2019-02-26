package nl.utwente.horus.representations.error

data class ErrorDto(
        val path: String,
        val message: String,
        val code: String
)