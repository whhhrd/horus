package nl.utwente.horus.services.person

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.entities.person.PersonRepository
import nl.utwente.horus.exceptions.PersonNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.transaction.Transactional

@Component
@Transactional
class PersonService {

    @Autowired
    lateinit var personRepository: PersonRepository

    fun getPersonByLoginId(loginId: String): Person {
        return personRepository.findPersonByLoginId(loginId) ?: throw PersonNotFoundException()
    }

    fun getPersonById(id: Long): Person {
        return personRepository.findById(id).orElseThrow()
    }

}