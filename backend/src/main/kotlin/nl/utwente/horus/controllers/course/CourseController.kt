package nl.utwente.horus.controllers.course

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CourseMismatchException
import nl.utwente.horus.exceptions.EmptySearchQueryException
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.exceptions.WrongCourseException
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseDtoSummary
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.dashboard.StudentDashboardDto
import nl.utwente.horus.representations.group.GroupSetDtoSummary
import nl.utwente.horus.representations.participant.*
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.sheets.ExportService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
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

    @GetMapping(path = ["", "/"], produces = [MediaType.APPLICATION_JSON_UTF8_VALUE])
    fun listCourses(): List<CourseDtoSummary> {
        val person: Person = userDetailService.getCurrentPerson()
        return person.participations.map { p -> CourseDtoSummary(p.course, RoleDtoBrief(p.role)) }
    }

    @PostMapping(path = ["", "/"])
    fun createCourse(@RequestBody dto: CourseCreateDto) : CourseDtoFull {
        checkGlobalPermission(Course::class, HorusPermissionType.CREATE)

        val course = courseService.createCourse(dto)
        val creator = userDetailService.getCurrentPerson()
        // TODO: Be able to check highest privileges via API
        // RoleID below is based on mocking data
        val participation = participantService.createParticipant(creator, course, 2)
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
        val assignmentSets: List<AssignmentSet>
        when {
            userDetailService.hasCoursePermission(courseId, HorusPermission.anyList(HorusResource.COURSE_ASSIGNMENTSET)) -> {
                assignmentSets = courseService.getAssignmentSetsOfCourse(courseId)
            }
            userDetailService.hasCoursePermission(courseId, HorusPermission.ownList(HorusResource.COURSE_ASSIGNMENTSET)) -> {
                assignmentSets = courseService.getAssignmentSetsOfCourseByPerson(courseId, userDetailService.getCurrentPerson())
            }
            else -> throw InsufficientPermissionsException()
        }
        return assignmentSets.map { AssignmentSetDtoBrief(it) }
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

    // TODO: Handle permissions of list-functions below.
    @GetMapping(path = ["/{courseId}/groupSets"])
    fun listGroupSetsOfCourse(@PathVariable courseId: Long) : List<GroupSetDtoSummary> {
        return courseService.getGroupSetsOfCourse(courseId).map { GroupSetDtoSummary(it) }
    }

    @GetMapping(path = ["/{courseId}/assignmentgroupsetsmappings"])
    fun listAssignmentGroupSetsMappings(@PathVariable courseId: Long) : List<AssignmentGroupSetsMappingDto> {
        return assignmentService.getAssignmentGroupSetsMappingsInCourse(courseId).map { AssignmentGroupSetsMappingDto(it) }
    }

    @GetMapping(path = ["/{courseId}/participants"])
    fun listParticipantsOfCourse(@PathVariable courseId: Long) : List<ParticipantDtoFull> {
        return courseService.getParticipantsOfCourse(courseId).map { ParticipantDtoFull(it) }
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

    // TODO: Fill in permissions for both below
    @GetMapping(path = ["/{courseId}/groups/search"])
    fun getSignOffGroupSearchResults(@PathVariable courseId: Long, @RequestParam query: String?): GroupAssignmentSetSearchResultDto {
        if (query == null || query.trim().isEmpty()) {
            throw EmptySearchQueryException()
        }
        return courseService.getSignOffGroupSearchResults(courseId, query)
    }

    @GetMapping(path = ["/{courseId}/signoffresults"])
    fun getSignOffResultsFiltered(@PathVariable courseId: Long, @RequestParam groupId: Long?, @RequestParam assignmentSetId: Long): List<SignOffResultDtoCompact> {
        return courseService.getSignOffResultsFilteredInCourse(courseId, groupId, assignmentSetId).map { SignOffResultDtoCompact(it) }
    }

    @GetMapping(path = ["/{courseId}/studentDashboard"])
    fun getStudentDashboard(@PathVariable courseId: Long): StudentDashboardDto {
        val participant = participantService.getCurrentParticipationInCourse(courseId)
        val sets = assignmentService.getAssignmentSetsByParticipant(participant)
        val results = signOffService.getSignOffsByParticipant(participant)
        val groups = groupService.getGroupsByParticipant(participant)
        return StudentDashboardDto(groups, sets, results)
    }

}