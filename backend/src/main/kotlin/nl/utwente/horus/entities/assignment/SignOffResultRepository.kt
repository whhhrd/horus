package nl.utwente.horus.entities.assignment

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface SignOffResultRepository: JpaRepository<SignOffResult, Long> {

    @Query("SELECT r FROM SignOffResult r INNER JOIN GroupMember gm ON r.participant = gm.id.participant INNER JOIN Group g ON gm.id.group = g WHERE g.id = ?1 AND r.assignment.assignmentSet.id = ?2 AND r.archivedAt IS NULL")
    fun getAllByGroupAndAssignmentSet(groupId: Long, assignmentSetId: Long): List<SignOffResult>

    fun getAllByParticipantIdAndAssignmentId(participantId: Long, assignmentId: Long): List<SignOffResult>

    fun getAllByParticipantIdAndAssignmentIdAndArchivedByIsNull(participantId: Long, assignmentId: Long): List<SignOffResult>


    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM SignOffResult r WHERE r.assignment.id IN ?1")
    fun existsByAssignment(assignmentIds: List<Long>): Boolean

    @Query("SELECT r FROM SignOffResult r WHERE r.assignment = ?1")
    fun getAssignmentSignOffResultByAssignment(assignment: Assignment): List<SignOffResult>

}