package nl.utwente.horus.controllers.course

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseDtoSummary
import nl.utwente.horus.representations.group.GroupSetDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import javax.ws.rs.Consumes

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
    fun listGroupSetsOfCourse(@PathVariable courseId: Long) : List<GroupSetDtoBrief> {
        return courseService.getGroupSetsOfCourse(courseId).map { GroupSetDtoBrief(it) }
    }

    @GetMapping(path = ["/{courseId}/assignmentgroupsetsmappings"])
    fun listAssignmentGroupSetsMappings(@PathVariable courseId: Long) : List<AssignmentGroupSetsMappingDto> {
        return assignmentService.getAssignmentGroupSetsMappingsInCourse(courseId).map { AssignmentGroupSetsMappingDto(it) }
    }

    @GetMapping(path = ["/{courseId}/participants"])
    fun listParticipantsOfCourse(@PathVariable courseId: Long) : List<ParticipantDto> {
        return courseService.getParticipantsOfCourse(courseId).map { ParticipantDto(it) }
    }

    @GetMapping(path = ["/{courseId}"])
    fun getFullCourse(@PathVariable courseId: Long): CourseDtoFull {
        val participation = participantService.getParticipationInCourse(courseId)
        return CourseDtoFull(courseService.getCourseById(courseId), RoleDtoBrief(participation.role))
    }

}