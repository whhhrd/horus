package nl.utwente.horus.controllers.course

import com.fasterxml.jackson.databind.ObjectMapper
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.group.LabelFilterOperator
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CourseMismatchException
import nl.utwente.horus.exceptions.EmptySearchQueryException
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.exceptions.WrongCourseException
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.auth.SupplementaryRoleCreateUpdateDto
import nl.utwente.horus.representations.auth.SupplementaryRoleDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseDtoSummary
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.dashboard.StudentDashboardDto
import nl.utwente.horus.representations.dsl.QueryNodeDto
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoSummary
import nl.utwente.horus.representations.participant.*
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import nl.utwente.horus.services.sheets.ExportService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.format.DateTimeFormatter
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping(path=["/api/courses"])
@Transactional
class CourseController: BaseController() {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var labelService: LabelService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var exportService: ExportService

    @Autowired
    lateinit var supplementaryRoleService: SupplementaryRoleService

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @GetMapping(path = ["", "/"], produces = [MediaType.APPLICATION_JSON_UTF8_VALUE])
    fun listCourses(): List<CourseDtoSummary> {
        val person: Person = userDetailService.getCurrentPerson()
        return person.enabledParticipations.map { p -> CourseDtoSummary(p.course, RoleDtoBrief(p.role)) }
    }

    @PostMapping(path = ["", "/"])
    fun createCourse(@RequestBody dto: CourseCreateDto) : CourseDtoFull {
        checkGlobalPermission(Course::class, HorusPermissionType.CREATE)

        val course = courseService.createCourse(dto)
        val creator = userDetailService.getCurrentPerson()
        val participation = participantService.createParticipant(creator, course, roleService.getTeacherRole())
        return CourseDtoFull(course, RoleDtoBrief(participation.role))
    }

    @PutMapping(path = ["/{courseId}"])
    fun updateCourse(@PathVariable courseId: Long, @RequestBody dto: CourseUpdateDto): CourseDtoFull {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.EDIT)

        val participant = participantService.getCurrentParticipationInCourse(courseId)
        return CourseDtoFull(courseService.updateCourse(courseId, dto), RoleDtoBrief(participant.role))
    }

    @GetMapping(path = ["/{courseId}/assignmentSets"])
    fun listAssignmentSetsOfCourse(@PathVariable courseId: Long) : List<AssignmentSetDtoBrief> {
        return anyOwnResult(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_ASSIGNMENTSET,
                { courseService.getAssignmentSetsOfCourse(courseId) },
                {person -> courseService.getAssignmentSetsOfCourseByPerson(courseId, person)}
        ).map { AssignmentSetDtoBrief(it) }

    }

    @PostMapping(path = ["/{courseId}/assignmentSets"])
    fun createAssignmentSetsInCourse(@PathVariable courseId: Long, @RequestBody dto: AssignmentSetCreateDto) : AssignmentSetDtoFull {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_ASSIGNMENTSET)

        val creator = userDetailService.getCurrentPerson()
        if (!userDetailService.hasCoursePermission(courseId,
                        HorusPermission.anyCreate(HorusResource.COURSE_ASSIGNMENTSET))) {
            throw InsufficientPermissionsException()
        }
        return AssignmentSetDtoFull(courseService.createAssignmentSetInCourse(creator, courseId, dto))
    }

    @GetMapping(path = ["/{courseId}/groupSets"])
    fun listGroupSetsOfCourse(@PathVariable courseId: Long) : List<GroupSetDtoSummary> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_GROUPSET)
        return courseService.getGroupSetsOfCourse(courseId).map { GroupSetDtoSummary(it) }
    }

    @GetMapping(path = ["/{courseId}/assignmentgroupsetsmappings"])
    fun listAssignmentGroupSetsMappings(@PathVariable courseId: Long) : List<AssignmentGroupSetsMappingDto> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_ASSIGNMENTSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_GROUPSET)

        return assignmentService.getAssignmentGroupSetsMappingsInCourse(courseId).map { AssignmentGroupSetsMappingDto(it) }
    }

    @GetMapping(path = ["/{courseId}/participants"])
    fun listParticipantsOfCourse(@PathVariable courseId: Long) : List<ParticipantDtoFull> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_PARTICIPANT)

        return courseService.getParticipantsOfCourse(courseId).map { ParticipantDtoFull(it) }
    }

    @GetMapping(path = ["/{courseId}/participants/self"])
    fun getCurrentParticipantInCourse(@PathVariable courseId: Long) : ParticipantDtoBrief {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_PARTICIPANT)

        return ParticipantDtoBrief(participantService.getCurrentParticipationInCourse(courseId))
    }

    @GetMapping(path = ["/{courseId}/staff"])
    fun listStaffOfCourse(@PathVariable courseId: Long): List<ParticipantDtoFull> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_PARTICIPANT)
        val course = courseService.getCourseById(courseId)

        return participantService.getCourseStaff(course).map { ParticipantDtoFull(it) }
    }

    @GetMapping(path = ["/{courseId}/supplementaryRoleMappings"])
    fun listSupplementaryRoleMappings(@PathVariable courseId: Long): List<ParticipantSupplementaryRoleMappingDto> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_SUPPLEMENTARY_ROLE_MAPPING)
        val course = courseService.getCourseById(courseId)

        return supplementaryRoleService.getMappingsByCourse(course).map { ParticipantSupplementaryRoleMappingDto(it) }
    }

    @PostMapping(path = ["/{courseId}/participants"])
    fun createParticipant(@PathVariable courseId: Long, @RequestBody dto: ParticipantCreateDto) : ParticipantDtoFull {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_PARTICIPANT)

        return ParticipantDtoFull(participantService.createParticipant(courseId, dto))
    }

    @GetMapping(path = ["/{courseId}/participants/{pid}"])
    fun getSingleParticipant(@PathVariable courseId: Long, @PathVariable pid: Long): ParticipantDtoFull {
        verifyCoursePermission(Participant::class, pid, HorusPermissionType.VIEW)
        val participant = participantService.getParticipantById(pid)
        if (participant.course.id != courseId) {
            throw WrongCourseException()
        }
        return ParticipantDtoFull(participant)
    }

    @PutMapping(path = ["/{courseId}/participants/{pid}"])
    fun updateParticipant(@PathVariable courseId: Long, @PathVariable pid: Long,
                          @RequestBody dto: ParticipantUpdateDto) : ParticipantDtoFull {
        verifyCoursePermission(Participant::class, pid, HorusPermissionType.EDIT)
        val participant = participantService.getParticipantById(pid)
        if (participant.course.id != courseId) {
            throw WrongCourseException()
        }
        return ParticipantDtoFull(participantService.updateParticipant(pid, dto))
    }

    @GetMapping(path = ["/{courseId}"])
    fun getFullCourse(@PathVariable courseId: Long): CourseDtoFull {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.VIEW)

        val participation = participantService.getCurrentParticipationInCourse(courseId)
        return CourseDtoFull(courseService.getCourseById(courseId), RoleDtoBrief(participation.role))
    }

    @GetMapping(path = ["/{courseId}/export"])
    fun getCourseSheet(@PathVariable courseId: Long, response: HttpServletResponse) {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_PARTICIPANT_LABEL_MAPPING)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_SIGNOFFRESULT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_ASSIGNMENTSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_GROUP)

        val course = courseService.getCourseById(courseId)
            val book = exportService.createCourseBook(course)
        val fileName = "${course.name}-${DateTimeFormatter.ISO_INSTANT.format(Instant.now())}.xlsx"
        sendFile(response, book::write, BaseController.XLSX_MIME, fileName)
    }

    @PostMapping(path = ["/{courseId}/labels"])
    fun addLabel(@PathVariable courseId: Long, @RequestBody dto: LabelCreateUpdateDto): LabelDto {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_LABEL)

        val course = courseService.getCourseById(courseId)
        return LabelDto(labelService.createLabel(course, dto))
    }

    @PutMapping(path = ["/{courseId}/labels/{labelId}"])
    fun updateLabel(@PathVariable courseId: Long, @PathVariable labelId: Long, @RequestBody dto: LabelCreateUpdateDto): LabelDto {
        verifyCoursePermission(Label::class, labelId, HorusPermissionType.EDIT)

        return LabelDto(labelService.updateLabel(courseId, labelId, dto))
    }

    @DeleteMapping(path = ["/{courseId}/labels/{labelId}"])
    fun deleteLabel(@PathVariable courseId: Long, @PathVariable labelId: Long) {
        verifyCoursePermission(Label::class, labelId, HorusPermissionType.DELETE)

        val label = labelService.getLabelById(labelId)
        if (label.course.id != courseId) {
            throw CourseMismatchException()
        }
        labelService.deleteLabel(label)
    }

    @GetMapping(path = ["/{courseId}/roles"])
    fun getSupplementaryRoles(@PathVariable courseId: Long): List<SupplementaryRoleDto> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_SUPPLEMENTARY_ROLE)

        val course = courseService.getCourseById(courseId)
        return supplementaryRoleService.getRolesByCourse(course).map { SupplementaryRoleDto(it) }
    }

    @PostMapping(path = ["/{courseId}/roles"])
    fun createSupplementaryRole(@PathVariable courseId: Long, @RequestBody dto: SupplementaryRoleCreateUpdateDto): SupplementaryRoleDto {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_SUPPLEMENTARY_ROLE)
        val result = supplementaryRoleService.createSupplementaryRole(courseId, dto)
        return SupplementaryRoleDto(result)
    }

    @GetMapping(path = ["/{courseId}/groups/search"])
    fun getSignOffGroupSearchResults(@PathVariable courseId: Long, @RequestParam query: String?): GroupAssignmentSetSearchResultDto {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.LIST, HorusResource.COURSE_GROUPSET)

        if (query == null || query.trim().isEmpty()) {
            throw EmptySearchQueryException()
        }
        return courseService.getSignOffGroupSearchResults(courseId, query)
    }

    @GetMapping(path = ["/{courseId}/signoffresults"])
    fun getSignOffResultsFiltered(@PathVariable courseId: Long, @RequestParam groupId: Long?, @RequestParam assignmentSetId: Long): List<SignOffResultDtoCompact> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_SIGNOFFRESULT)

        return courseService.getSignOffResultsFilteredInCourse(courseId, groupId, assignmentSetId).map { SignOffResultDtoCompact(it) }
    }

    @GetMapping(path = ["/{courseId}/studentDashboard"])
    fun getStudentDashboard(@PathVariable courseId: Long): StudentDashboardDto {
        // No permissions necessary: all results are "personalized" anyways
        val participant = participantService.getCurrentParticipationInCourse(courseId)
        val sets = assignmentService.getAssignmentSetsByParticipant(participant)
        val results = signOffService.getUnarchivedSignOffsByParticipant(participant)
        val groups = groupService.getGroupsByParticipant(participant)
        return StudentDashboardDto(groups, sets, results)
    }

    @GetMapping(path = ["/{courseId}/groups/filtered"])
    fun getGroupsFiltered(pageable: Pageable, @PathVariable courseId: Long, @RequestParam groupSetId: Long?, @RequestParam assignmentSetId: Long?, @RequestParam labelIds: List<Long>?, @RequestParam operator: LabelFilterOperator?, @RequestParam query: String?): Page<GroupDtoFull> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.VIEW, HorusResource.COURSE_GROUP)
        val queryNode = if (query != null) objectMapper.readValue(query, QueryNodeDto::class.java) else null
        val groups = courseService.getGroupsOfCourseFiltered(pageable, courseId, groupSetId, assignmentSetId,labelIds ?: emptyList(), operator, queryNode)
        return groups.map { GroupDtoFull(it) }
    }

}