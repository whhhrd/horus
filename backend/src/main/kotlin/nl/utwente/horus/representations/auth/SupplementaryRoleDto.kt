package nl.utwente.horus.representations.auth

import nl.utwente.horus.entities.auth.SupplementaryRole

data class SupplementaryRoleDto(
        val id: Long,
        val name: String,
        val permissions: List<String>
) {
    constructor(role: SupplementaryRole) : this(role.id, role.name, role.permissions.map { it.name })
}