package nl.utwente.horus.services.participant

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.participant.ParticipantRepository
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.NoParticipantException
import nl.utwente.horus.services.auth.HorusUserDetailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class ParticipantService {

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    fun getParticipationInCourse(courseId: Long) : Participant {
        val person: Person = userDetailService.getCurrentPerson()
        return person.participations.firstOrNull { it.course.id == courseId } ?: throw NoParticipantException()
    }

    fun getParticipationInCourse(person: Person, courseId: Long) : Participant {
        return person.participations.firstOrNull { it.course.id == courseId } ?: throw NoParticipantException()
    }

}