package nl.utwente.horus.services.participant

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.*
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.*
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
import java.util.stream.Stream

@Component
@Transactional
class ParticipantService {

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Autowired
    lateinit var participantLabelMappingRepository: ParticipantLabelMappingRepository

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


    companion object {
        const val STUDENT_ID = 1L
        const val TEACHER_ID = 2L
        const val TEACHING_ASSISTANT_ID = 3L
    }

    fun getParticipantsById(ids: Collection<Long>): List<Participant> {
        // Prevent duplications in request
        val set = ids.toSet()
        if (ids.size != set.size) {
            throw DuplicateEntityRequestException()
        }
        val result = participantRepository.findAllById(ids)
        if (result.size != set.size) {
            throw ParticipantNotFoundException() // One of ID's wasn't found, since there were no duplicates
        }
        return result
    }

    fun getCourseStaff(course: Course): List<Participant> {
        return participantRepository.findAllByCourseAndRoleIdIn(course, listOf(TEACHER_ID, TEACHING_ASSISTANT_ID))
    }

    fun getParticipantById(id: Long): Participant {
        return participantRepository.findByIdOrNull(id) ?: throw ParticipantNotFoundException()
    }

    fun doesParticipantExist(personId: Long, courseId: Long): Boolean {
        return participantRepository.findParticipantByPersonIdAndCourseId(personId, courseId) != null
    }

    fun getCurrentParticipationInCourse(courseId: Long) : Participant {
        val person: Person = userDetailService.getCurrentPerson()
        return participantRepository.findParticipantByPersonIdAndCourseId(person.id, courseId) ?: throw ParticipantNotFoundException()
    }

    fun getParticipationInCourse(person: Person, courseId: Long) : Participant {
        return person.participations.firstOrNull { it.course.id == courseId } ?: throw NoParticipantException()
    }

    fun getParticipationsInCourse(personIds: Set<Long>, courseId: Long): List<Participant> {
        val result = participantRepository.findAllByPersonIdInAndCourseId(personIds, courseId)
        if (personIds.size != result.size) {
            throw ParticipantNotFoundException()
        }
        return result
    }

    fun getCourseParticipationsStream(course: Course): Stream<Participant> {
        return participantRepository.findAllByCourseSorted(course)
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
            val newThread = commentService.getThreadById(commentThreadId)
            addThread(participant, newThread)
        }

        // TODO: Discuss: should this be able to go true -> false -> true?
        participant.enabled = enabled
        return participant
    }

    fun addThread(p: Participant, thread: CommentThread) {
        if (p.commentThread == null) {
            p.commentThread = thread
        } else {
            throw ExistingThreadException()
        }
    }

    fun addLabel(participant: Participant, label: Label) {
        if (participant.course.id != label.course.id) {
            throw CourseMismatchException()
        }
        val author = getCurrentParticipationInCourse(label.course.id)
        if (participant.labels.contains(label)) {
            throw ExistingLabelException()
        }
        val mapping = participantLabelMappingRepository.save(ParticipantLabelMapping(participant, label, author))
        participant.labelMappings.add(mapping)
        label.participantMappings.add(mapping)
    }

    fun removeLabelMapping(participant: Participant, label: Label) {
        val mapping = participant.labelMappings.firstOrNull { it.label.id == label.id } ?: throw LabelNotLinkedException()
        participant.labelMappings.remove(mapping)
        label.participantMappings.remove(mapping)
        participantLabelMappingRepository.delete(mapping)
    }


}