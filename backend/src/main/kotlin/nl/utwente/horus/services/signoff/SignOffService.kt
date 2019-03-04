package nl.utwente.horus.services.signoff

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.AssignmentSignOffResult
import nl.utwente.horus.entities.assignment.AssignmentSignOffResultRepository
import nl.utwente.horus.entities.group.Group
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class SignOffService {

    @Autowired
    lateinit var assignmentSignOffResultRepository: AssignmentSignOffResultRepository

    fun getSignOffResults(group: Group, assignmentSet: AssignmentSet): List<AssignmentSignOffResult> {
        return assignmentSignOffResultRepository.getAllByGroupAndAssignmentSet(group.id, assignmentSet.id)
    }
}