package nl.utwente.horus.entities.assignment

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface AssignmentSignOffResultRepository: JpaRepository<AssignmentSignOffResult, Long> {

    @Query("SELECT r FROM AssignmentSignOffResult r INNER JOIN GroupMember gm ON r.id.participant = gm.id.participant INNER JOIN Group g ON gm.id.group = g WHERE g.id = ?1 AND r.id.assignment.assignmentSet.id = ?2")
    fun getAllByGroupAndAssignmentSet(groupId: Long, assignmentSetId: Long): List<AssignmentSignOffResult>

}