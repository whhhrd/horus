package nl.utwente.horus.representations.auth

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.auth.permissions.HorusResourceScope

data class HorusPermissionDto (
        val resource: HorusResource,

        val scope: HorusResourceScope,

        val type: HorusPermissionType) {

    constructor(permission: HorusPermission): this(permission.resource, permission.scope, permission.type)
}