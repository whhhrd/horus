package nl.utwente.horus.services.signoff

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.AssignmentSignOffResultRepository
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class SignOffService {

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var assignmentSignOffResultRepository: AssignmentSignOffResultRepository

    fun getSignOffResults(group: Group, assignmentSet: AssignmentSet): List<SignOffResult> {
        return assignmentSignOffResultRepository.getAllByGroupAndAssignmentSet(group.id, assignmentSet.id)
    }


    fun doAssignmentsHaveSignOffResults(ids: List<Long>): Boolean {
        return assignmentSignOffResultRepository.existsByAssignment(ids)
    }

    fun getAssignmentSignOffResults(assignment: Assignment): List<SignOffResult> {
        return assignmentSignOffResultRepository.getAssignmentSignOffResultByAssignment(assignment)
    }

    fun deleteSignOffResult(result: SignOffResult) {
        // Delete associations
        if (result.commentThread != null) {
            commentService.deleteCommentsThread(result.commentThread!!)
        }

        assignmentSignOffResultRepository.delete(result)
    }
}