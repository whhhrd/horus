package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.exceptions.ForbiddenException
import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/assignmentSets"])
@Transactional
class AssignmentSetsController {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/{assignmentSetId}"])
    fun getFullById(@PathVariable assignmentSetId: Long) : AssignmentSetDtoFull {
        val assignmentSet = assignmentService.getAssignmentSetById(assignmentSetId)
        val courseId = assignmentSet.course.id

        val hasAny = userDetailService.hasCoursePermission(courseId, HorusPermission.anyView(HorusResource.COURSE_ASSIGNMENTSET))
        val hasOwn = userDetailService.hasCoursePermission(courseId,
                HorusPermission.ownView(HorusResource.COURSE_ASSIGNMENTSET))
        val isMappedToSet = assignmentService.isPersonMappedToAssignmentSet(userDetailService.getCurrentPerson(), assignmentSet)
        if (!(hasAny || (hasOwn && isMappedToSet))) {
            throw InsufficientPermissionsException()
        }

        return AssignmentSetDtoFull(assignmentSet)
    }

    @PutMapping(path = ["/{assignmentSetId}"])
    fun updateAssignmentSet(@PathVariable assignmentSetId: Long, @RequestBody dto: AssignmentSetUpdateDto) : AssignmentSetDtoFull {
        val creator = userDetailService.getCurrentPerson()
        if (!userDetailService.hasCoursePermission(assignmentService.getAssignmentSetById(assignmentSetId).course.id,
                        HorusPermission.anyEdit(HorusResource.COURSE_ASSIGNMENTSET))) {
            throw InsufficientPermissionsException()
        }
        return AssignmentSetDtoFull(assignmentService.updateAssignmentSet(creator, assignmentSetId, dto))
    }

    @DeleteMapping(path = ["/{assignmentSetId}"])
    fun deleteAssignmentSet(@PathVariable assignmentSetId: Long) {
        assignmentService.deleteAssignmentSet(assignmentService.getAssignmentSetById(assignmentSetId))
    }
}