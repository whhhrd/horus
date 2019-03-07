package nl.utwente.horus.entities.course

import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface CourseRepository: JpaRepository<Course, Long> {

    fun findCourseByExternalId(externalId: String): Course?

    @Query("SELECT c FROM Course c INNER JOIN Participant p ON p.person = ?1 AND p.course = c")
    fun findCoursesByPerson(person: Person): List<Course>

    fun existsCourseByExternalId(externalId: String): Boolean

}