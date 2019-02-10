package nl.utwente.horus.representations.auth

import nl.utwente.horus.entities.auth.Permission
import nl.utwente.horus.entities.course.Course
import org.springframework.security.core.GrantedAuthority

/**
 * HorusAuthority represents a permssion granted on the application.
 */
class HorusAuthority(course: Course, permission: Permission): GrantedAuthority {

    val courseId: Long = course.id

    val permission: String = permission.name

    override fun getAuthority(): String {
        return "course/${courseId}/${permission}"
    }

}