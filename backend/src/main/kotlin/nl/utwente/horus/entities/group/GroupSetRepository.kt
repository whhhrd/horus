package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.person.Person
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface GroupSetRepository: JpaRepository<GroupSet, Long> {

    fun getGroupSetByExternalId(externalId: String): GroupSet?

    @Query("SELECT CASE WHEN COUNT(person) > 0 THEN TRUE ELSE FALSE END FROM Person person INNER JOIN Participant part ON part.person = person INNER JOIN GroupMember gm ON gm.id.participant = part WHERE person = ?1 AND gm.id.group.groupSet = ?2")
    fun isPersonMemberOfGroupSet(person: Person, gs: GroupSet): Boolean

}