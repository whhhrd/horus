package nl.utwente.horus.controllers.course

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.EmptySearchQueryException
import nl.utwente.horus.exceptions.WrongCourseException
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseDtoSummary
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.group.GroupSetDtoSummary
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.participant.ParticipantDto
import nl.utwente.horus.representations.participant.ParticipantUpdateDto
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/courses"])
@Transactional
class CourseController {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var participantService: ParticipantService

    @GetMapping(path = ["", "/"], produces = [MediaType.APPLICATION_JSON_UTF8_VALUE])
    fun listCourses(): List<CourseDtoSummary> {
        val person: Person = userDetailService.getCurrentPerson()
        return person.participations.map { p -> CourseDtoSummary(p.course, RoleDtoBrief( p.role)) }
    }

    @PostMapping(path = ["", "/"])
    fun createCourse(@RequestBody dto: CourseCreateDto) : CourseDtoFull {
        val course = courseService.createCourse(dto)
        val creator = userDetailService.getCurrentPerson()
        // TODO: Be able to check highest privileges via API
        // RoleID below is based on mocking data
        val participation = participantService.createParticipant(creator, course, 2)
        return CourseDtoFull(course, RoleDtoBrief(participation.role))
    }

    @PutMapping(path = ["/{courseId}"])
    fun updateCourse(@PathVariable courseId: Long, @RequestBody dto: CourseUpdateDto): CourseDtoFull {
        val participant = participantService.getCurrentParticipationInCourse(courseId)
        // TODO: Check permissions
        return CourseDtoFull(courseService.updateCourse(courseId, dto), RoleDtoBrief(participant.role))
    }

    @GetMapping(path = ["/{courseId}/assignmentSets"])
    fun listAssignmentSetsOfCourse(@PathVariable courseId: Long) : List<AssignmentSetDtoBrief> {
        return courseService.getAssignmentSetsOfCourse(courseId).map { AssignmentSetDtoBrief(it) }
    }

    @PostMapping(path = ["/{courseId}/assignmentSets"])
    fun createAssignmentSetsInCourse(@PathVariable courseId: Long, @RequestBody dto: AssignmentSetCreateDto) : AssignmentSetDtoFull {
        val creator = userDetailService.getCurrentPerson()
        // TODO: check permissions
        return AssignmentSetDtoFull(courseService.createAssignmentSetInCourse(creator, courseId, dto))
    }

    @GetMapping(path = ["/{courseId}/groupSets"])
    fun listGroupSetsOfCourse(@PathVariable courseId: Long) : List<GroupSetDtoSummary> {
        return courseService.getGroupSetsOfCourse(courseId).map { GroupSetDtoSummary(it) }
    }

    @GetMapping(path = ["/{courseId}/assignmentgroupsetsmappings"])
    fun listAssignmentGroupSetsMappings(@PathVariable courseId: Long) : List<AssignmentGroupSetsMappingDto> {
        return assignmentService.getAssignmentGroupSetsMappingsInCourse(courseId).map { AssignmentGroupSetsMappingDto(it) }
    }

    @GetMapping(path = ["/{courseId}/participants"])
    fun listParticipantsOfCourse(@PathVariable courseId: Long) : List<ParticipantDto> {
        return courseService.getParticipantsOfCourse(courseId).map { ParticipantDto(it) }
    }

    @PostMapping(path = ["/{courseId}/participants"])
    fun createParticipant(@PathVariable courseId: Long, @RequestBody dto: ParticipantCreateDto) : ParticipantDto {
        return ParticipantDto(participantService.createParticipant(courseId, dto))
    }

    @GetMapping(path = ["/{courseId}/participants/{pid}"])
    fun getSingleParticipant(@PathVariable courseId: Long, @PathVariable pid: Long): ParticipantDto {
        val participant = participantService.getParticipantById(pid)
        if (participant.course.id != courseId) {
            throw WrongCourseException()
        }
        return ParticipantDto(participant)
    }

    @PutMapping(path = ["/{courseId}/participants/{pid}"])
    fun updateParticipant(@PathVariable courseId: Long, @PathVariable pid: Long,
                          @RequestBody dto: ParticipantUpdateDto) : ParticipantDto {
        val participant = participantService.getParticipantById(pid)
        if (participant.course.id != courseId) {
            throw WrongCourseException()
        }
        return ParticipantDto(participantService.updateParticipant(pid, dto))
    }

    @GetMapping(path = ["/{courseId}"])
    fun getFullCourse(@PathVariable courseId: Long): CourseDtoFull {
        val participation = participantService.getCurrentParticipationInCourse(courseId)
        return CourseDtoFull(courseService.getCourseById(courseId), RoleDtoBrief(participation.role))
    }

    @GetMapping(path = ["/{courseId}/groups/search"])
    fun getSignOffGroupSearchResults(@PathVariable courseId: Long, @RequestParam query: String?): GroupAssignmentSetSearchResultDto {
        if (query == null || query.trim().isEmpty()) {
            throw EmptySearchQueryException()
        }
        return courseService.getSignOffGroupSearchResults(courseId, query)
    }

    @GetMapping(path = ["/{courseId}/signoffresults"])
    fun getSignOffResultsFiltered(@PathVariable courseId: Long, @RequestParam groupId: Long, @RequestParam assignmentSetId: Long): List<SignOffResultDtoCompact> {
        return courseService.getSignOffResultsFilteredInCourse(courseId, groupId, assignmentSetId).map { SignOffResultDtoCompact(it) }
    }

}