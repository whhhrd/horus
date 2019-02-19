package nl.utwente.horus.services.course

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.course.CourseRepository
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CourseNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Component
@Transactional
class CourseService {

    @Autowired
    lateinit var courseRepository: CourseRepository

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var roleService: RoleService

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

    fun createAssignmentSetInCourse(creator: Person, courseId: Long, dto: AssignmentSetCreateDto): AssignmentSet {
        val course = getCourseById(courseId)
        val participant = participantService.getParticipationInCourse(creator, courseId)
        return assignmentService.createAssignmentSet(participant, course, dto)
    }

    fun createCourse(dto: CourseCreateDto): Course {
        return createCourse(dto.name, dto.externalId, dto.courseCode)
    }

    fun createCourse(name: String, externalId: String?, courseCode: String?): Course {
        val course = Course(courseCode, externalId, name)
        courseRepository.save(course)
        return course
    }

    fun updateCourse(id: Long, dto: CourseUpdateDto): Course {
        return updateCourse(id, dto.courseCode, dto.name, dto.archivedAt)
    }

    fun updateCourse(id: Long, courseCode: String?, name: String,
                     archivedAt: ZonedDateTime?): Course {
        val course = getCourseById(id)
        course.courseCode = courseCode
        course.name = name
        course.archivedAt = archivedAt
        return course
    }
}