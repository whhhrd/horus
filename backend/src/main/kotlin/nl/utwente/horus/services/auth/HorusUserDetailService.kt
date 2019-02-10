package nl.utwente.horus.services.auth

import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component

@Component
class HorusUserDetailService: UserDetailsService {

    @Autowired
    lateinit var personService: PersonService

    override fun loadUserByUsername(username: String?): UserDetails {
        return HorusUserDetails(personService.getPersonByLoginId(username!!))
    }

    fun loadUserById(id: Long): UserDetails {
        return HorusUserDetails(personService.getPersonById(id))
    }
}