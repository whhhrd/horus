package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
interface ParticipantSupplementaryRoleMappingRepository: JpaRepository<ParticipantSupplementaryRoleMapping,
        ParticipantSupplementaryRoleMapping.ParticipantSupplementaryRoleMappingId> {

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN TRUE ELSE FALSE END FROM ParticipantSupplementaryRoleMapping m WHERE m.id.participant = ?1 AND m.id.supplementaryRole = ?2")
    fun isSupplementaryRoleAssigned(participant: Participant, role: SupplementaryRole): Boolean

    @Query("SELECT m FROM ParticipantSupplementaryRoleMapping m WHERE m.id.participant = ?1 AND m.id.supplementaryRole = ?2")
    fun findByParticipantAndSupplementaryRole(p: Participant, r: SupplementaryRole): ParticipantSupplementaryRoleMapping?

    @Query("SELECT m FROM ParticipantSupplementaryRoleMapping m WHERE m.id.participant.course = ?1")
    fun findAllByCourse(c: Course): List<ParticipantSupplementaryRoleMapping>
}