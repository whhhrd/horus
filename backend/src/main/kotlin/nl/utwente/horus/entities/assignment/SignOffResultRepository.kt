package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.participant.Participant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface SignOffResultRepository: JpaRepository<SignOffResult, Long> {

    @Query("SELECT r FROM SignOffResult r INNER JOIN GroupMember gm ON r.participant = gm.id.participant INNER JOIN Group g ON gm.id.group = g WHERE g.id = ?1 AND r.assignment.assignmentSet.id = ?2 AND r.archivedAt IS NULL")
    fun getAllByGroupAndAssignmentSet(groupId: Long, assignmentSetId: Long): List<SignOffResult>

    fun getAllByParticipant(participant: Participant): List<SignOffResult>

    // TODO: check performance and optimize
    fun getAllByAssignmentAssignmentSetAndArchivedByIsNull(assignmentSet: AssignmentSet): List<SignOffResult>

    fun getAllByParticipantIdAndAssignmentId(participantId: Long, assignmentId: Long): List<SignOffResult>

    fun getAllByParticipantIdAndAssignmentIdAndArchivedByIsNull(participantId: Long, assignmentId: Long): List<SignOffResult>

    fun countAllByAssignment(assignment: Assignment): Long

    @Query("SELECT r FROM SignOffResult r WHERE r.assignment = ?1")
    fun getAssignmentSignOffResultByAssignment(assignment: Assignment): List<SignOffResult>

}