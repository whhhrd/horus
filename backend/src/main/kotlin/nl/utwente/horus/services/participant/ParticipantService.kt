package nl.utwente.horus.services.participant

import nl.utwente.horus.entities.participant.ParticipantRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class ParticipantService {

    @Autowired
    lateinit var participantRepository: ParticipantRepository

}