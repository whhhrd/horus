package nl.utwente.horus.entities.auth

import java.io.Serializable
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.ManyToOne

@Entity
data class RolePermission (
        @EmbeddedId
        private val id: RolePermissionId
) {
    @Embeddable
    data class RolePermissionId (
            @ManyToOne
            val role: Role,

            @ManyToOne
            val permission: Permission
    ): Serializable

    val role
        get() = this.id.role

    val permission
        get() = this.id.permission

    constructor(role: Role, permission: Permission): this(RolePermissionId(role, permission))

}