package nl.utwente.horus.entities.auth

import javax.persistence.*

@Entity
data class Role (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        val name: String
) {
    @OneToMany(mappedBy = "id.role", cascade = [CascadeType.ALL], orphanRemoval = true)
    val rolePermissions: MutableSet<RolePermission> = HashSet()

    val permissions: List<Permission>
        get() = rolePermissions.map { rp -> rp.permission }
}