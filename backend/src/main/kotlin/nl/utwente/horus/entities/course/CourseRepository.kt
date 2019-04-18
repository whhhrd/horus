package nl.utwente.horus.entities.course

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface CourseRepository: JpaRepository<Course, Long> {

    fun findCourseByExternalId(externalId: String): Course?

    @Query("SELECT c FROM Course c INNER JOIN Participant p ON p.person = ?1 AND p.course = c AND p.enabled = true")
    fun findCoursesByPersonEnabled(person: Person): List<Course>

    fun existsCourseByExternalId(externalId: String): Boolean

    @Query("SELECT cEnd FROM Course cEnd " +
            "WHERE cEnd IN (SELECT c FROM Course c INNER JOIN AssignmentSet asSet ON asSet.course = c INNER JOIN Assignment a ON a.assignmentSet = asSet AND a.commentThread = ?1 )" +
            "OR cEnd IN (SELECT c FROM Course c INNER JOIN GroupSet gSet ON gSet.course = c INNER JOIN Group g ON g.groupSet = gSet AND g.commentThread = ?1)" +
            "OR cEnd IN (SELECT c FROM Course c INNER JOIN Participant p ON p.course = c AND p.commentThread = ?1)" +
            "OR cEnd IN (SELECT c FROM Course c INNER JOIN AssignmentSet asSet ON asSet.course = c INNER JOIN Assignment a ON a.assignmentSet = asSet INNER JOIN SignOffResult r ON r.assignment = a AND r.commentThread = ?1 )")
    fun findCoursesByCommentThread(thread: CommentThread): List<Course>

}