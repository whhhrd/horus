package nl.utwente.horus.controllers.canvas

import nl.utwente.horus.exceptions.GroupSetNotFoundException
import nl.utwente.horus.representations.BooleanResultDto
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.representations.canvas.CanvasTokenDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoFull
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

    @PutMapping(path = ["/{canvasId}/all"])
    fun syncAll(@PathVariable canvasId: String): CourseDtoFull {
        val course = courseService.getCourseByExternalId(canvasId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        canvasService.doFullCanvasSync(participant.person, course)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{canvasId}/persons"])
    fun syncPersons(@PathVariable canvasId: String): CourseDtoFull {
        val course = courseService.getCourseByExternalId(canvasId)
        canvasService.doCanvasPersonSync(course)
        val participant = courseService.getCurrentParticipationInCourse(course)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{canvasId}/sets"])
    fun syncSets(@PathVariable canvasId: String): CourseDtoFull {
        val course = courseService.getCourseByExternalId(canvasId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        canvasService.doCanvasGroupCategoriesFetch(course, participant)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{canvasId}/sets/{canvasSetId}"])
    fun syncGroupsInSet(@PathVariable canvasId: String, @PathVariable canvasSetId: String): GroupSetDtoFull {
        val course = courseService.getCourseByExternalId(canvasId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        val set = groupService.getGroupSetByExternalId(canvasSetId) ?: throw GroupSetNotFoundException()
        canvasService.doCanvasGroupsSync(set, participant)
        return GroupSetDtoFull(set)
    }
}