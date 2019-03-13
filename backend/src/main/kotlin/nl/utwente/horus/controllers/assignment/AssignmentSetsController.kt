package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupDtoSummary
import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/assignmentSets"])
@Transactional
class AssignmentSetsController: BaseController() {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

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
}