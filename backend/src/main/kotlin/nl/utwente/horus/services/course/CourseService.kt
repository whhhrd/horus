package nl.utwente.horus.services.course

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.course.CourseRepository
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CourseNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class CourseService {

    @Autowired
    lateinit var courseRepository: CourseRepository

    fun getCourseById(courseId: Long): Course {
        return courseRepository.findByIdOrNull(courseId) ?: throw CourseNotFoundException()
    }

    fun getAllCourses(): List<Course> {
        return courseRepository.findAll()
    }

    fun getAllParticipatingCourses(person: Person): List<Course> {
        return courseRepository.findCoursesByPerson(person)
    }

    fun getAssignmentSetsOfCourse(courseId: Long) : List<AssignmentSet> {
        return getCourseById(courseId).assignmentSets.toList()
    }

    fun getGroupSetsOfCourse(courseId: Long) : List<GroupSet> {
        return getCourseById(courseId).groupSets.toList()
    }

    fun getParticipantsOfCourse(courseId: Long) : List<Participant> {
        return getCourseById(courseId).participants.toList()
    }
}