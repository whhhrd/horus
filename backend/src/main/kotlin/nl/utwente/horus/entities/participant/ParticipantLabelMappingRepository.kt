package nl.utwente.horus.entities.participant

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface ParticipantLabelMappingRepository: JpaRepository<ParticipantLabelMapping, Long> {

    @Query("SELECT COUNT(m) FROM ParticipantLabelMapping m WHERE m.id.label = ?1")
    fun countLabelUsages(label: Label): Long

    /**
     * Deletes all mappings to given participants
     */
    fun deleteByIdParticipantIn(participants: Collection<Participant>)
}