package nl.utwente.horus.entities.auth

import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.OneToMany

@Entity
data class Role (
        @Id
        val name: RoleName
) {
    @OneToMany(mappedBy = "id.role", cascade = [CascadeType.ALL], orphanRemoval = true)
    val rolePermissions: MutableSet<RolePermission> = HashSet()

    val permissions: List<Permission>
        get() = rolePermissions.map { rp -> rp.permission }
}