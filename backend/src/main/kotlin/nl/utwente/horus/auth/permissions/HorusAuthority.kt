package nl.utwente.horus.auth.permissions

import nl.utwente.horus.entities.auth.Permission
import nl.utwente.horus.entities.course.Course
import org.springframework.security.core.GrantedAuthority

/**
 * HorusAuthority represents a permission granted on the application.
 */
class HorusAuthority(val courseIds: Collection<Long>, val permission: HorusPermission): GrantedAuthority {

    constructor(courses: Collection<Course>, permission: Permission): this(
            courses.map { it.id },
            HorusPermission(permission.name)
    )

    override fun getAuthority(): String {
        if (permission.isCourse()){
            return "$permission${courseIds.joinToString(",", ":")}"
        }
        return permission.toString()
    }

}