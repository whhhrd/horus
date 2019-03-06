package nl.utwente.horus.auth.permissions

import java.util.*

class HorusPermission {

    val resource: HorusResource
    val scope: HorusResourceScope
    val type: HorusPermissionType

    companion object {
        fun ownList(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, HorusPermissionType.LIST)
        }

        fun ownView(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, HorusPermissionType.VIEW)
        }

        fun ownEdit(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, HorusPermissionType.EDIT)
        }

        fun anyList(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, HorusPermissionType.LIST)
        }

        fun anyView(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, HorusPermissionType.VIEW)
        }

        fun anyCreate(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, HorusPermissionType.CREATE)
        }

        fun anyEdit(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, HorusPermissionType.EDIT)
        }

        fun anyDelete(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, HorusPermissionType.DELETE)
        }
    }

    constructor(resource: HorusResource, scope: HorusResourceScope, type: HorusPermissionType) {
        this.resource = resource
        this.scope = scope
        this.type = type
    }

    constructor(str: String) {
        val components = str.split("/")
        this.type = HorusPermissionType.valueOf(components.last())
        this.scope = HorusResourceScope.valueOf(components[components.size-2])
        this.resource = HorusResource.valueOf(components.first())
    }

    fun isCourse(): Boolean {
        return this.resource.name.startsWith(HorusResource.COURSE_PREFIX)
    }

    override fun toString(): String {
        return "$resource/$scope/$type"
    }

    override fun equals(other: Any?): Boolean {
        if (other is HorusPermission) {
            return  other.resource == this.resource &&
                    other.scope == this.scope &&
                    other.type == this.type
        }
        return false
    }

    override fun hashCode(): Int {
        return Objects.hash(HorusPermission::class.java, resource, scope, type)
    }
}