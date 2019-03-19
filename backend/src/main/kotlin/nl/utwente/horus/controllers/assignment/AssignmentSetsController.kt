package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.exceptions.CourseMismatchException
import nl.utwente.horus.exceptions.EmptyListException
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.sheets.ExportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.format.DateTimeFormatter
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping(path=["/api/assignmentSets"])
@Transactional
class AssignmentSetsController: BaseController() {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService
    
    @Autowired
    lateinit var exportService: ExportService

    @GetMapping(path = ["/{assignmentSetId}"])
    fun getFullById(@PathVariable assignmentSetId: Long) : AssignmentSetDtoFull {
        verifyCoursePermission(AssignmentSet::class, assignmentSetId, HorusPermissionType.VIEW)

        val assignmentSet = assignmentService.getAssignmentSetById(assignmentSetId)

        return AssignmentSetDtoFull(assignmentSet)
    }

    @PutMapping(path = ["/{assignmentSetId}"])
    fun updateAssignmentSet(@PathVariable assignmentSetId: Long, @RequestBody dto: AssignmentSetUpdateDto) : AssignmentSetDtoFull {
        verifyCoursePermission(AssignmentSet::class, assignmentSetId, HorusPermissionType.EDIT)

        val creator = userDetailService.getCurrentPerson()
        if (!userDetailService.hasCoursePermission(assignmentService.getAssignmentSetById(assignmentSetId).course.id,
                        HorusPermission.anyEdit(HorusResource.COURSE_ASSIGNMENTSET))) {
            throw InsufficientPermissionsException()
        }
        return AssignmentSetDtoFull(assignmentService.updateAssignmentSet(creator, assignmentSetId, dto))
    }

    @DeleteMapping(path = ["/{assignmentSetId}"])
    fun deleteAssignmentSet(@PathVariable assignmentSetId: Long) {
        verifyCoursePermission(AssignmentSet::class, assignmentSetId, HorusPermissionType.DELETE)
        assignmentService.deleteAssignmentSet(assignmentService.getAssignmentSetById(assignmentSetId))
    }

    @GetMapping(path = ["/{assignmentSetId}/groups"])
    fun getMappedGroups(pageable: Pageable, @PathVariable assignmentSetId: Long): Page<GroupDtoFull> {
        return assignmentService.getGroupsMappedToAssignmentSetByAssignmentSetId(pageable, assignmentSetId).map{group -> GroupDtoFull(group)}
    }

    @GetMapping(path = ["/export"])
    fun getSetsSheet(@RequestParam ids: List<Long>, response: HttpServletResponse) {
        if (ids.isEmpty()) {
            throw EmptyListException()
        }
        val first = assignmentService.getAssignmentSetById(ids.first())
        val courseId = first.course.id
        if (ids.map(assignmentService::getAssignmentSetById).map { it.course.id }.any { it != courseId }) {
            throw CourseMismatchException()
        }

        val book = exportService.createAssignmentSetsBook(ids)
        val fileName = "${first.course.name}-${ids.joinToString(",")}-${DateTimeFormatter.ISO_INSTANT.format(Instant.now())}.xlsx"
        sendFile(response, book::write, BaseController.XLSX_MIME, fileName)
    }
}