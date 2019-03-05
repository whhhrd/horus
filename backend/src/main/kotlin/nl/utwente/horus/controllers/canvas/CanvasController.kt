package nl.utwente.horus.controllers.canvas

import nl.utwente.horus.representations.BooleanResultDto
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.representations.canvas.CanvasTokenDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoSummary
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.canvas.CanvasService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/canvas"])
@Transactional
class CanvasController {
    @Autowired
    lateinit var canvasService: CanvasService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var groupService: GroupService

    @PostMapping(path = ["/", ""])
    fun addToken(@RequestBody token: CanvasTokenDto) {
        val user = userDetailService.getCurrentPerson()
        canvasService.addToken(user, token.token)
    }

    @GetMapping(path = ["/", ""])
    fun listCanvasCourses(): List<CanvasCourseDto> {
        val user = userDetailService.getCurrentPerson()
        return canvasService.listCanvasCourses(user, true, true)
    }

    @GetMapping(path = ["/tokenValid"])
    fun checkToken(): BooleanResultDto {
        val result: Boolean
        val user = userDetailService.getCurrentPerson()
        result = try {
            canvasService.checkPersonCanvasTokenValid(user)
        } catch (e: Exception) {
            false
        }
        return BooleanResultDto(result)
    }

    @PostMapping(path = ["/{canvasId}"])
    fun addCourse(@PathVariable canvasId: String): CourseDtoFull {
        val user = userDetailService.getCurrentPerson()
        val course = canvasService.addCanvasCourse(user, canvasId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        return CourseDtoFull(courseService.getCourseById(course.id), RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{courseId}/all"])
    fun syncAll(@PathVariable courseId: Long): CourseDtoFull {
        val course = courseService.getCourseById(courseId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        canvasService.doFullCanvasSync(participant.person, course)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{courseId}/persons"])
    fun syncPersons(@PathVariable courseId: Long): CourseDtoFull {
        val course = courseService.getCourseById(courseId)
        canvasService.doCanvasPersonSync(course)
        val participant = courseService.getCurrentParticipationInCourse(course)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{courseId}/sets"])
    fun syncSets(@PathVariable courseId: Long): List<GroupSetDtoSummary> {
        val course = courseService.getCourseById(courseId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        canvasService.doCanvasGroupCategoriesFetch(course, participant)
        return course.groupSets.map { GroupSetDtoSummary(it) }
    }

    @PutMapping(path = ["/{courseId}/sets/{setId}"])
    fun syncGroupsInSet(@PathVariable courseId: Long, @PathVariable setId: Long): List<GroupDtoFull> {
        val course = courseService.getCourseById(courseId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        val set = groupService.getGroupSetById(setId)
        canvasService.doCanvasGroupsSync(set, participant)
        return set.groups.map { GroupDtoFull(it) }
    }
}