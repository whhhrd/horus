package nl.utwente.horus.services.participant

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.participant.ParticipantRepository
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.NoParticipantException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.participant.ParticipantUpdateDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class ParticipantService {

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var roleService: RoleService

    fun getParticipantById(id: Long): Participant {
        return participantRepository.findByIdOrNull(id) ?: throw ParticipantNotFoundException()
    }

    fun getParticipationInCourse(courseId: Long) : Participant {
        val person: Person = userDetailService.getCurrentPerson()
        return person.participations.firstOrNull { it.course.id == courseId } ?: throw NoParticipantException()
    }

    fun getParticipationInCourse(person: Person, courseId: Long) : Participant {
        return person.participations.firstOrNull { it.course.id == courseId } ?: throw NoParticipantException()
    }


    fun createParticipant(courseId: Long, dto: ParticipantCreateDto): Participant {
        return createParticipant(personService.getPersonById(dto.personId),
                courseService.getCourseById(courseId), dto.roleId)
    }

    fun createParticipant(person: Person, course: Course, roleId: Long): Participant {
        val role = roleService.getRoleById(roleId)
        val participant = participantRepository.save(Participant(person, course, role))
        course.participants.add(participant)
        person.participations.add(participant)
        return participant
    }

    fun updateParticipant(id: Long, dto: ParticipantUpdateDto): Participant {
        return updateParticipant(id, dto.roleId, dto.commentThreadId, dto.enabled)
    }

    fun updateParticipant(id: Long, roleId: Long, commentThreadId: Long?, enabled: Boolean): Participant {
        val participant = getParticipantById(id)

        participant.role = roleService.getRoleById(roleId)
        // Check if comment thread has changed
        if (commentThreadId != null) {
            val existingThread = participant.commentThread
            val replacement = commentService.getThreadById(commentThreadId)
            if (existingThread == null) {
                participant.commentThread = replacement
            } else if (existingThread.id != replacement.id) {
                participant.commentThread = replacement
                // Also delete old thread
                commentService.deleteCommentsThread(existingThread)
            }
        }

        // TODO: Discuss: should this be able to go true -> false -> true?
        participant.enabled = enabled
        return participant
    }


}