package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface CanvasTokenRepository: JpaRepository<CanvasToken, Long> {

    fun getCanvasTokenByPerson(person: Person): CanvasToken?

}