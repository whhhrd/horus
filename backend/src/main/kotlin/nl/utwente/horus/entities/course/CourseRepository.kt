package nl.utwente.horus.entities.course

import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CourseRepository: JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c INNER JOIN Participant p ON p.person = person AND p.course = c")
    fun findCoursesByPerson(person: Person): List<Course>

}