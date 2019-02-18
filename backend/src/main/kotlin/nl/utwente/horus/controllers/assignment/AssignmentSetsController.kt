package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.participant.ParticipantService
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
    lateinit var assignmentSetService: AssignmentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/{assignmentSetId}"])
    fun getFullById(@PathVariable assignmentSetId: Long) : AssignmentSetDtoFull {
        return AssignmentSetDtoFull(assignmentSetService.getAssignmentSetById(assignmentSetId))
    }

    @PutMapping(path = ["/{assignmentSetId}"])
    fun updateAssignmentSet(@PathVariable assignmentSetId: Long, @RequestBody dto: AssignmentSetUpdateDto) : AssignmentSetDtoFull {
        val creator = userDetailService.getCurrentPerson()
        // TODO: check permissions
        return AssignmentSetDtoFull(assignmentSetService.updateAssignmentSet(creator, assignmentSetId, dto))
    }
}