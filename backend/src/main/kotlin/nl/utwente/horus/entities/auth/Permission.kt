package nl.utwente.horus.entities.auth

import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.OneToMany

@Entity
data class Permission (
        @Id
        val name: String
) {
    @OneToMany(mappedBy = "id.permission", cascade = [CascadeType.ALL], orphanRemoval = true)
    val rolePermissions: MutableSet<RolePermission> = HashSet()
}