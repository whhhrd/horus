package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Stream

@Repository
@Transactional
interface ParticipantRepository: JpaRepository<Participant, Long> {

    @Query("SELECT p FROM Participant p WHERE p.course = ?1 ORDER BY p.person.sortableName")
    fun findAllByCourseSorted(course: Course): Stream<Participant>

    fun findParticipantByPersonIdAndCourseId(personId: Long, courseId: Long): Participant?

    fun findAllByPersonIdInAndCourseId(personIds: Collection<Long>, courseId: Long): List<Participant>
}