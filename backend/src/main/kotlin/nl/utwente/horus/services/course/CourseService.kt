package nl.utwente.horus.services.course

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.auth.permissions.HorusResource.*
import nl.utwente.horus.auth.permissions.HorusResourceScope
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.course.CourseRepository
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.group.LabelFilterOperator
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.exceptions.CourseNotFoundException
import nl.utwente.horus.exceptions.GroupNotFoundException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.dsl.QueryNodeDto
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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

    @Autowired
    lateinit var supplementaryRoleService: SupplementaryRoleService

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
        return courseRepository.findCoursesByPersonEnabled(person)
    }

    fun getAssignmentSetsOfCourse(courseId: Long) : List<AssignmentSet> {
        return getCourseById(courseId).assignmentSets.toList()
    }

    fun getAssignmentSetsOfCourseByPerson(courseId: Long, person: Person): List<AssignmentSet> {
        val participant = participantService.getParticipationInCourse(person, courseId)
        return assignmentService.getAssignmentSetsByParticipant(participant)
    }

    fun getGroupSetsOfCourse(courseId: Long) : List<GroupSet> {
        return getCourseById(courseId).groupSets.toList()
    }

    fun getGroupsOfCourseFiltered(pageable: Pageable, courseId: Long, groupSetId: Long?, assignmentSetId: Long?, labelIds: List<Long>, operator: LabelFilterOperator?, query: QueryNodeDto?): Page<Group> {
        return groupService.getGroupsFiltered(pageable, courseId, groupSetId, assignmentSetId, labelIds, operator, query)
    }

    fun getParticipantsOfCourse(courseId: Long) : List<Participant> {
        return getCourseById(courseId).enabledParticipants.toList()
    }

    fun getCurrentParticipationInCourse(course: Course): Participant {
        val user = userDetailService.getCurrentPerson()
        return course.enabledParticipants.firstOrNull { it.person.id == user.id } ?: throw ParticipantNotFoundException()
    }

    fun getCoursesOfCommentThread(thread: CommentThread): List<Course> {
        return courseRepository.findCoursesByCommentThread(thread)
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
        addDefaultSupplementaryRoles(course)
        return course
    }

    private fun addDefaultSupplementaryRoles(course: Course) {
        val createAllForResources: (String, List<HorusResource>) -> Unit = { name, resources ->
            val permissions = resources.map { resource ->
                // For each available resource and for each type within that resource, compose the Permission
                HorusPermission.availableTypesForResource.getValue(resource).map { type ->
                    HorusPermission(resource, HorusResourceScope.ANY, type) }
            }.flatten()
            supplementaryRoleService.createSupplementaryRole(course, name, permissions)
        }
        val createAllForResource: (String, HorusResource) -> Unit = { name, resource ->
            createAllForResources(name, listOf(resource))
        }

        createAllForResource("Assignment editor", COURSE_ASSIGNMENTSET)
        createAllForResources("Canvas syncer", listOf(
                COURSE_PARTICIPANT,
                COURSE_GROUPSET, COURSE_GROUP))
        createAllForResource("Label assigner", COURSE_PARTICIPANT_LABEL_MAPPING)
        createAllForResource("Label editor", COURSE_LABEL)
        createAllForResources("Comment manager", listOf(
                COURSE_COMMENT_PUBLIC,
                COURSE_COMMENT_STAFFONLY))
        createAllForResources("Admin", listOf(
                COURSE_PARTICIPANT,
                COURSE_SUPPLEMENTARY_ROLE,
                COURSE_SUPPLEMENTARY_ROLE_MAPPING,
                COURSE_LABEL,
                COURSE_PARTICIPANT_LABEL_MAPPING,
                COURSE_GROUPSET,
                COURSE_GROUP,
                COURSE_GROUPMEMBER,
                COURSE_ASSIGNMENTSET,
                COURSE_COMMENT_STAFFONLY,
                COURSE_COMMENT_PUBLIC,
                COURSE_SIGNOFFRESULT
        ))

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

    fun getSignOffResultsFilteredInCourse(courseId: Long, groupId: Long?, assignmentSetId: Long): List<SignOffResult> {
        val assignmentSet = assignmentService.getAssignmentSetById(assignmentSetId)
        if (assignmentSet.course.id != courseId) {
            throw AssignmentSetNotFoundException()
        }
        if (groupId != null) {
            val group = groupService.getGroupById(groupId)
            if (group.groupSet.course.id != courseId) {
                throw GroupNotFoundException()
            }
            return signOffService.getGroupAssignmentSetSignOffResults(group, assignmentSet)
        } else {
            return signOffService.getAssignmentSetSignOffResults(assignmentSet)
        }
    }
}
