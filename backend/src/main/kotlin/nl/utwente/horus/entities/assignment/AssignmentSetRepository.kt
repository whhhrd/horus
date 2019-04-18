package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface AssignmentSetRepository: JpaRepository<AssignmentSet, Long> {

    /**
     * Verify that a given person is included to be graded for an assignment set
     * by being in a group belonging to a group set that allowed for the given assignment set.
     */
    @Query("SELECT CASE WHEN COUNT(DISTINCT agm.id.assignmentSet) > 0 THEN TRUE ELSE FALSE END FROM Person p " +
            "INNER JOIN Participant part ON part.person = p AND part.enabled = true " +
            "INNER JOIN GroupMember gm ON gm.id.participant = part " +
            "INNER JOIN Group g ON gm.id.group = g " +
            "INNER JOIN GroupSet gs ON g.groupSet = gs " +
            "INNER JOIN AssignmentGroupSetsMapping agm ON agm.id.groupSet = gs " +
            "WHERE agm.id.assignmentSet = ?1 AND p = ?2")
    fun isAssignmentSetMappedToPerson(assignmentSet: AssignmentSet, person: Person): Boolean


    /**
     * Get all assignment sets that a given participant is mapped to by being in a group
     * which belongs to a group set that is allowed for an assignment set.
     */
    @Query("SELECT DISTINCT agm.id.assignmentSet FROM GroupMember gm " +
            "INNER JOIN Group g ON gm.id.group = g " +
            "INNER JOIN GroupSet gs ON g.groupSet = gs " +
            "INNER JOIN AssignmentGroupSetsMapping agm ON agm.id.groupSet = gs " +
            "WHERE gm.id.participant = ?1 AND gm.id.participant.enabled = true")
    fun getAssignmentSetsMappedToParticipant(participant: Participant): List<AssignmentSet>
}