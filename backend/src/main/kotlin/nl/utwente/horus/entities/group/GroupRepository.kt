package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.person.Person
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface GroupRepository: JpaRepository<Group, Long> {

    fun findByExternalId(externalId: String): List<Group>

    @Query("SELECT CASE WHEN COUNT(person) > 0 THEN TRUE ELSE FALSE END FROM Person person INNER JOIN Participant part ON part.person = person INNER JOIN GroupMember gm ON gm.id.participant = part WHERE person = ?1 AND gm.id.group = ?2")
    fun isPersonMemberOfGroup(person: Person, group: Group): Boolean

    @Query("SELECT DISTINCT m.id.group.id, m.id.group.name, m.id.group.createdAt, agm.id.assignmentSet.id, agm.id.assignmentSet.name, agm.id.assignmentSet.createdAt FROM GroupMember m INNER JOIN AssignmentGroupSetsMapping agm ON agm.id.groupSet = m.id.group.groupSet WHERE (LOWER(m.id.group.name) LIKE CONCAT('%', LOWER(?2) , '%') OR LOWER(m.id.participant.person.loginId) LIKE CONCAT('%', LOWER(?2) , '%') OR LOWER(m.id.participant.person.fullName) LIKE CONCAT('%', LOWER(?2) , '%')) AND m.id.group.groupSet.course.id = ?1 AND m.id.group.archivedAt IS NULL")
    fun findDistinctTopByNameOrMemberName(courseId: Long, query: String): List<Array<Any>>

    @Query("SELECT m.id.group.id,m.id.participant.person.fullName,m.id.participant.person.loginId FROM GroupMember m WHERE m.id.group.id IN ?1")
    fun findFullNamesAndLoginIdsOfMembersInGroups(groupIds: List<Long>): List<Array<Any>>

    @Query("SELECT g FROM Group g INNER JOIN AssignmentGroupSetsMapping ags ON g.groupSet = ags.id.groupSet WHERE ags.id.assignmentSet.id = ?1 AND g.archivedAt IS NULL")
    fun findAllByMappedAssignmentSetId(pageable: Pageable, assignmentSetId: Long): Page<Group>

    fun findAllByGroupSetIdAndAndArchivedAtIsNull(groupSetId: Long): List<Group>
}