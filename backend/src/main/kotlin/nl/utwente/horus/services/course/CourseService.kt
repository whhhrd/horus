package nl.utwente.horus.services.course

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.AssignmentSignOffResult
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.course.CourseRepository
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.exceptions.CourseNotFoundException
import nl.utwente.horus.exceptions.GroupNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.signoff.SignOffService
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
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var signOffService: SignOffService

    fun getCourseById(courseId: Long): Course {
        return courseRepository.findByIdOrNull(courseId) ?: throw CourseNotFoundException()
    }

    fun getCourseByExternalId(externalId: String): Course {
        return courseRepository.findCourseByExternalId(externalId) ?: throw CourseNotFoundException()
    }

    fun existsCourseByExternalId(externalId: String): Boolean {
        return courseRepository.existsCourseByExternalId(externalId)
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

    fun getCurrentParticipationInCourse(course: Course): Participant {
        val user = userDetailService.getCurrentPerson()
        return course.participants.first { it.person.id == user.id }
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

    fun getSignOffGroupSearchResults(courseId: Long, query: String): GroupAssignmentSetSearchResultDto {
        return groupService.getGroupSignOffSearchResults(courseId, query)
    }

    fun getSignOffResultsFilteredInCourse(courseId: Long, groupId: Long, assignmentSetId: Long): List<AssignmentSignOffResult> {
        val group = groupService.getGroupById(groupId)
        val assignmentSet = assignmentService.getAssignmentSetById(assignmentSetId)
        if (group.groupSet.course.id != courseId) {
            throw GroupNotFoundException()
        }
        if (assignmentSet.course.id != courseId) {
            throw AssignmentSetNotFoundException()
        }
        return signOffService.getSignOffResults(group, assignmentSet)
    }
}