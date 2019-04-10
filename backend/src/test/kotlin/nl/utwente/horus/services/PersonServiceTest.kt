package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class PersonServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var personService: PersonService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetPersonByLoginId() {
        val loginId = "s123456"
        assertNull(personService.getPersonByLoginId(loginId))
        val createdPerson = this.createPerson(loginId)
        val retrievedPerson = personService.getPersonByLoginId(loginId)
        assertEquals(createdPerson, retrievedPerson)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetPersonById() {
        val createdPerson = this.createPerson("s123456")
        val retrievedPerson = personService.getPersonById(createdPerson.id)
        assertEquals(createdPerson, retrievedPerson)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreatePerson() {
        val createdPerson = this.createPerson("s123456")
        val retrievedPerson = personService.getPersonById(createdPerson.id)
        assertEquals(createdPerson, retrievedPerson)
    }

    private fun createPerson(loginId: String): Person {
        return personService.createPerson(loginId, "Test Person",
                "TP", "Person, Test", "test@person.nl")
    }

}
