package nl.utwente.horus.entities.assignment

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface AssignmentSignOffResultRepository: JpaRepository<AssignmentSignOffResult, Long> {

    @Query("SELECT r FROM AssignmentSignOffResult r INNER JOIN GroupMember gm ON r.id.participant = gm.id.participant INNER JOIN Group g ON gm.id.group = g WHERE g.id = ?1 AND r.id.assignment.assignmentSet.id = ?2")
    fun getAllByGroupAndAssignmentSet(groupId: Long, assignmentSetId: Long): List<AssignmentSignOffResult>

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM AssignmentSignOffResult r WHERE r.id.assignment.id IN ?1")
    fun existsByAssignment(assignmentIds: List<Long>): Boolean

    @Query("SELECT r FROM AssignmentSignOffResult r WHERE r.id.assignment = ?1")
    fun getAssignmentSignOffResultByAssignment(assignment: Assignment): List<AssignmentSignOffResult>

}