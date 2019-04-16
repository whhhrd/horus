package nl.utwente.horus.controllers.canvas

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.BooleanResultDto
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.representations.canvas.CanvasTokenDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoSummary
import nl.utwente.horus.representations.job.BatchJobDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.canvas.CanvasService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.sheets.ImportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.BufferedReader
import java.io.InputStreamReader

@RestController
@RequestMapping(path=["/api/canvas"])
@Transactional
class CanvasController: BaseController() {
    @Autowired
    lateinit var canvasService: CanvasService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var importService: ImportService

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
    fun addCourse(@PathVariable canvasId: String): BatchJobDto {
        checkGlobalPermission(Course::class, HorusPermissionType.CREATE)

        val batch = executeAsBatchJob("Canvas course import") {
            canvasService.addCanvasCourse(canvasId, it)
        }

        return BatchJobDto(batch)
    }

    @PutMapping(path = ["/{courseId}/all"])
    fun syncAll(@PathVariable courseId: Long): BatchJobDto {
        // TODO: Check global person create permission
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_PARTICIPANT)

        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUPSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_GROUPSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_GROUPSET)

        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_GROUP)

        val course = courseService.getCourseById(courseId)
        val batch = executeAsBatchJob("Canvas full sync for ${course.name}") {
            canvasService.doFullCanvasSync(courseId, it)
        }
        return BatchJobDto(batch)
    }

    @PutMapping(path = ["/{courseId}/participants"])
    fun syncParticipants(@PathVariable courseId: Long): CourseDtoFull {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_PARTICIPANT)

        val course = courseService.getCourseById(courseId)
        canvasService.doCanvasParticipantSync(course)
        val participant = courseService.getCurrentParticipationInCourse(course)
        return CourseDtoFull(course, RoleDtoBrief(participant.role))
    }

    @PutMapping(path = ["/{courseId}/sets"])
    fun syncSets(@PathVariable courseId: Long): List<GroupSetDtoSummary> {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUPSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_GROUPSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_GROUPSET)

        val course = courseService.getCourseById(courseId)
        val participant = courseService.getCurrentParticipationInCourse(course)
        canvasService.doCanvasGroupCategoriesFetch(course, participant)
        return course.groupSets.map { GroupSetDtoSummary(it) }
    }

    @PostMapping(path = ["/{courseId}/sets"])
    fun uploadCsvSet(@PathVariable courseId: Long, @RequestParam file: MultipartFile, @RequestParam name: String, @RequestParam excessGroups: Int): BatchJobDto {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_PARTICIPANT)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_PARTICIPANT)

        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUPSET)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUPMEMBER)

        val course = courseService.getCourseById(courseId)
        val reader = BufferedReader(InputStreamReader(file.inputStream))
        val batch = executeAsBatchJob("Groups upload for $name in ${course.name}") {
            importService.importCsv(reader, courseId, name, excessGroups, it)
        }
        return BatchJobDto(batch)
    }

    @PutMapping(path = ["/{courseId}/sets/{setId}"])
    fun syncGroupsInSet(@PathVariable courseId: Long, @PathVariable setId: Long): BatchJobDto {
        requireAnyPermission(Course::class, courseId, HorusPermissionType.CREATE, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.EDIT, HorusResource.COURSE_GROUP)
        requireAnyPermission(Course::class, courseId, HorusPermissionType.DELETE, HorusResource.COURSE_GROUP)
        val set = groupService.getGroupSetById(setId)
        val batch = executeAsBatchJob("Group set sync for ${set.name} in ${set.course.name}") {
            val course = courseService.getCourseById(courseId)
            canvasService.doCanvasParticipantSync(course)
            canvasService.doCanvasGroupsSync(setId, it)
        }
        return BatchJobDto(batch)
    }
}