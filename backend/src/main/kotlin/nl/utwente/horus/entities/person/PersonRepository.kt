package nl.utwente.horus.entities.person

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import javax.transaction.Transactional

@Repository
@Transactional
interface PersonRepository: JpaRepository<Person, Long> {

    fun findPersonByLoginId(loginId: String): Person?

}