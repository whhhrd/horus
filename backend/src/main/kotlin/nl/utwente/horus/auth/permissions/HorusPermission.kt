package nl.utwente.horus.auth.permissions

import nl.utwente.horus.auth.permissions.HorusPermissionType.*
import nl.utwente.horus.auth.permissions.HorusResource.*
import java.util.*

class HorusPermission {

    val resource: HorusResource
    val scope: HorusResourceScope
    val type: HorusPermissionType

    companion object {
        fun ownList(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, LIST)
        }

        fun ownView(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, VIEW)
        }

        fun ownEdit(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.OWN, EDIT)
        }

        fun anyList(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, LIST)
        }

        fun anyView(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, VIEW)
        }

        fun anyCreate(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, CREATE)
        }

        fun anyEdit(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, EDIT)
        }

        fun anyDelete(resource: HorusResource): HorusPermission {
            return HorusPermission(resource, HorusResourceScope.ANY, DELETE)
        }

        val ALL_TYPES = HorusPermissionType.values().toList()

        val availableTypesForResource = mapOf(
                PERSON to ALL_TYPES,
                COURSE to ALL_TYPES,
                COURSE_PARTICIPANT to ALL_TYPES,
                COURSE_GROUPSET to ALL_TYPES,
                COURSE_GROUP to ALL_TYPES,
                COURSE_GROUPMEMBER to listOf(LIST, VIEW, CREATE, DELETE),
                COURSE_ASSIGNMENTSET to ALL_TYPES,
                COURSE_COMMENT_STAFFONLY to ALL_TYPES,
                COURSE_COMMENT_PUBLIC to ALL_TYPES,
                COURSE_SIGNOFFRESULT to ALL_TYPES,
                COURSE_LABEL to ALL_TYPES,
                COURSE_PARTICIPANT_LABEL_MAPPING to listOf(LIST, VIEW, CREATE, DELETE),
                COURSE_SUPPLEMENTARY_ROLE_MAPPING to listOf(LIST, VIEW, CREATE, DELETE),
                COURSE_SUPPLEMENTARY_ROLE to ALL_TYPES
        )

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