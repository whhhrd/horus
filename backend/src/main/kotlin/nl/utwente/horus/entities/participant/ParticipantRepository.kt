package nl.utwente.horus.entities.participant

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface ParticipantRepository: JpaRepository<Participant, Long> {
}