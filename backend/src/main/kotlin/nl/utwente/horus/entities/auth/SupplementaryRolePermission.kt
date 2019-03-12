package nl.utwente.horus.entities.auth

import java.io.Serializable
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.ManyToOne

@Entity
data class SupplementaryRolePermission (
        @EmbeddedId
        private val id: SupplementaryRolePermissionId
) {
    @Embeddable
    data class SupplementaryRolePermissionId (
            @ManyToOne
            val supplementaryRole: SupplementaryRole,

            @ManyToOne
            val permission: Permission
    ): Serializable

    constructor(role: SupplementaryRole, permission: Permission): this(SupplementaryRolePermissionId(role, permission))

    val supplementaryRole
        get() = this.id.supplementaryRole

    val permission
        get() = this.id.permission


}