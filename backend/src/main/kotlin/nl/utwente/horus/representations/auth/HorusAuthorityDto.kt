package nl.utwente.horus.representations.auth

import nl.utwente.horus.auth.permissions.HorusAuthority
import nl.utwente.horus.auth.permissions.HorusPermission

data class HorusAuthorityDto (
        val permission: HorusPermissionDto,

        val courseIds: List<Long>?
) {

    constructor(permission: HorusPermission, courseIds: List<Long>?): this(HorusPermissionDto(permission), courseIds)

    constructor(permission: HorusPermissionDto): this(permission, null)

    constructor(authority: HorusAuthority): this(authority.permission, authority.courseIds.toList())
}