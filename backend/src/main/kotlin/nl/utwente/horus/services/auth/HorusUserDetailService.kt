package nl.utwente.horus.services.auth

import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
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

}