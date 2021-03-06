package nl.utwente.horus.services.person

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.entities.person.PersonRepository
import nl.utwente.horus.exceptions.PersonNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
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
        return personRepository.findByIdOrNull(id) ?: throw PersonNotFoundException()
    }

    fun createPerson(loginId: String, fullName: String, shortName: String, sortableName: String, email: String): Person {
        val person = Person(loginId, fullName, shortName, sortableName, email)
        personRepository.save(person)
        return person
    }

}