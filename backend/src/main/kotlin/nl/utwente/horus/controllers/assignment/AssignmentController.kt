package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.representations.BooleanResultDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/assignments"])
@Transactional
class AssignmentController {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @GetMapping(path = ["/deletable"])
    fun canDeleteAssignments(@RequestParam assignmentIds: List<Long>): BooleanResultDto  {
        val result = signOffService.doAssignmentsHaveSignOffResults(assignmentIds)
        return BooleanResultDto(!result)
    }

    @DeleteMapping(path = ["/{assignmentId}"])
    fun deleteAssignment(@PathVariable assignmentId: Long) {
        assignmentService.deleteAssignment(assignmentService.getAssignmentById(assignmentId))
    }

}