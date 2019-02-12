package nl.utwente.horus.services.auth

import nl.utwente.horus.auth.tokens.AbstractJWTToken
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.AuthenticationRequiredException
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
        val person = token?.userDetails?.person
        return if (person != null) person else throw AuthenticationRequiredException()
    }

}