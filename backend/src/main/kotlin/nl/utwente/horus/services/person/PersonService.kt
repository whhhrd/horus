package nl.utwente.horus.services.person

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.entities.person.PersonRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class PersonService {

    @Autowired
    lateinit var personRepository: PersonRepository

    fun getPersonByLoginId(loginId: String): Person? {
        return personRepository.findPersonByLoginId(loginId)
    }

    fun getPersonById(id: Long): Person {
        return personRepository.findById(id).orElseThrow()
    }

}