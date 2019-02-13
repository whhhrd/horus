package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.services.assignment.AssignmentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path=["/api/assignmentSets"])
@Transactional
class AssignmentSetsController {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var assignmentSetService: AssignmentService

    @GetMapping(path = ["/{assignmentSetId}"])
    fun getFullById(@PathVariable assignmentSetId: Long) : AssignmentSetDtoFull {
        return AssignmentSetDtoFull(assignmentSetService.getAssignmentSetById(assignmentSetId))
    }

}