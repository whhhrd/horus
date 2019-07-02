package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.participant.Participant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface GroupMemberRepository: JpaRepository<GroupMember, GroupMember.GroupMemberId> {

    @Query("SELECT gm FROM GroupMember gm " +
            "INNER JOIN Group g ON gm.id.group = g " +
            "INNER JOIN GroupSet gs ON g.groupSet = gs " +
            "INNER JOIN AssignmentGroupSetsMapping agm ON agm.id.groupSet = gs " +
            "WHERE agm.id.assignmentSet = ?1 AND gm.id.participant IN ?2 AND g.archivedAt IS NULL")
    fun getParticipantAssignmentMappingMemberships(participants: Collection<Participant>, assigmentSet: AssignmentSet): Set<GroupMember>

    @Query("SELECT gm FROM GroupMember gm " +
            "INNER JOIN Group g ON gm.id.group = g " +
            "INNER JOIN GroupSet gs ON g.groupSet = gs " +
            "INNER JOIN AssignmentGroupSetsMapping agm ON agm.id.groupSet = gs " +
            "WHERE agm.id.assignmentSet = ?1 AND g.archivedAt IS NULL")
    fun getParticipantAssignmentMappingMemberships(assigmentSet: AssignmentSet): Set<GroupMember>


}