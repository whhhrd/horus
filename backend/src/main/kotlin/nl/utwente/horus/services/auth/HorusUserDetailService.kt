package nl.utwente.horus.services.auth

import nl.utwente.horus.auth.tokens.AbstractJWTToken
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.AuthenticationRequiredException
import nl.utwente.horus.auth.permissions.HorusAuthority
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.representations.person.PersonDtoFull
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class HorusUserDetailService: UserDetailsService {

    @Autowired
    lateinit var personService: PersonService

    override fun loadUserByUsername(username: String?): UserDetails? {
        val person = personService.getPersonByLoginId(username!!) ?: return null
        return HorusUserDetails(person)
    }

    fun getCurrentPerson(): Person {
        val token: AbstractJWTToken? = SecurityContextHolder.getContext().authentication as? AbstractJWTToken?

        return token?.userDetails?.person ?: throw AuthenticationRequiredException()
    }

    fun hasCoursePermission(courseId: Long, permission: HorusPermission): Boolean {
        val token: AbstractJWTToken? = SecurityContextHolder.getContext().authentication as? AbstractJWTToken?
        val authorities = token?.userDetails?.authorities as MutableCollection<HorusAuthority>? ?: return false
        return authorities.any { authority -> authority.permission == permission && authority.courseIds.contains(courseId) }
    }

    fun hasAnyCoursePermissions(courseId: Long, vararg permissions: HorusPermission): Boolean {
        return permissions.any { p -> hasCoursePermission(courseId, p) }
    }

    fun hasAllCoursePermission(courseId: Long, vararg permissions: HorusPermission): Boolean {
        return permissions.all { p -> hasCoursePermission(courseId, p) }
    }

    fun getUserDetailPersonDto(userDetails: HorusUserDetails): PersonDtoFull {
        return PersonDtoFull(userDetails.person)
    }

}