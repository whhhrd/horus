package nl.utwente.horus.representations.auth

data class SupplementaryRoleCreateUpdateDto(
        val name: String,
        val permissions: List<String>
)