package nl.utwente.horus.services.signoff

import nl.utwente.horus.entities.assignment.*
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.*
import nl.utwente.horus.representations.signoff.SignOffResultArchiveDto
import nl.utwente.horus.representations.signoff.SignOffResultCreateDto
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.ZonedDateTime

@Component
@Transactional
class SignOffService {

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var signOffResultRepository: SignOffResultRepository

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    companion object {
        val SIGNOFF_MODIFY_TIMEOUT = Duration.ofMinutes(5)
    }

    fun getSignOffResultById(id: Long): SignOffResult {
        return signOffResultRepository.findByIdOrNull(id) ?: throw SignOffResultNotFoundException()
    }

    fun getGroupAssignmentSetSignOffResults(group: Group, assignmentSet: AssignmentSet): List<SignOffResult> {
        return signOffResultRepository.getAllByGroupAndAssignmentSet(group.id, assignmentSet.id)
    }

    fun getSignOffResultCounts(ids: List<Long>): Map<Assignment, Long> {
        val result = HashMap<Assignment, Long>()
        ids.forEach {id ->
            val assignment = assignmentService.getAssignmentById(id)
            result[assignment] = signOffResultRepository.countAllByAssignment(assignment)
        }
        return result
    }

    fun getAssignmentSignOffResults(assignment: Assignment): List<SignOffResult> {
        return signOffResultRepository.getAssignmentSignOffResultByAssignment(assignment)
    }

    fun getAssignmentSetSignOffResults(assignmentSet: AssignmentSet): List<SignOffResult> {
        return signOffResultRepository.getAllByAssignmentAssignmentSetAndArchivedByIsNullOrderByAssignmentOrderKey(assignmentSet)
    }

    fun getSignOffHistory(participantId: Long, assignmentId: Long): List<SignOffResult> {
        return signOffResultRepository.getAllByParticipantIdAndAssignmentId(participantId, assignmentId)
    }

    fun getUnarchivedByParticipantAndAssignmentSet(participant: Participant, assignmentSet: AssignmentSet): List<SignOffResultType?> {
        return signOffResultRepository.getUnarchivedByParticipantAndAssignmentSet(participant, assignmentSet)
    }

    fun getSignOffsByParticipant(participant: Participant): List<SignOffResult> {
        return signOffResultRepository.getAllByParticipant(participant)
    }

    fun processSignOffs(dto: SignOffResultPatchDto, setId: Long): List<SignOffResult> {
        val assignmentSet = assignmentService.getAssignmentSetById(setId)
        val course = assignmentSet.course
        // Verify that all assignments belong to this set
        val deletionSignOffs = signOffResultRepository.findAllById(dto.delete.map { it.id })
        val assignmentIds = dto.create.map { it.assignmentId } + deletionSignOffs.map { it.assignment.id }
        val assignments = assignmentService.getAssignmentsByIds(assignmentIds)
        if (assignments.any { it.assignmentSet.id != assignmentSet.id }) {
            throw DifferentAssignmentSetException()
        }
        // Verify that all participants belong to the same course as the set
        val participantIds = dto.create.map { it.participantId } + deletionSignOffs.map { it.participant.id }
        val participants = participantService.getParticipantsById(participantIds)
        if (participants.any { it.course.id != course.id }) {
            throw CourseMismatchException()
        }

        archiveSignOffs(dto.delete, assignmentSet.course.id)
        return createSignOffs(dto.create, assignmentSet.course.id)
    }

    private fun createSignOffs(dtos: List<SignOffResultCreateDto>, courseId: Long): List<SignOffResult> {
        val signer = participantService.getCurrentParticipationInCourse(courseId)
        return dtos.map { dto ->
            createSignOffResult(dto, signer)
        }
    }

    private fun createSignOffResult(dto: SignOffResultCreateDto, signer: Participant): SignOffResult {
        val now = ZonedDateTime.now()
        val student = participantService.getParticipantById(dto.participantId)
        if (student.course.id != signer.course.id) {
            throw ParticipantNotFoundException()
        }

        // Archive older results if necessary
        val existing = getSignOffHistory(dto.participantId, dto.assignmentId)
        // Get last result (the last one signed or archived)
        val last = existing.sortedByDescending { if (it.isArchived) it.archivedAt else it.signedAt }.firstOrNull()
        val modificationDeadline = now - SIGNOFF_MODIFY_TIMEOUT

        // Check if last result is modifiable
        val modifiable = if (last != null && last.signedBy.id == signer.id) {
            // If last exists and the signers are the same
            if (last.isArchived) {
                // If it's archived, then the modifiable if deadline has not passed and
                // the archiver is also the signer
                last.archivedAt!!.isAfter(modificationDeadline) && last.archivedBy!!.id == signer.id
            } else {
                // If it's not archived, then modifiable is deadline has not passed
                last.signedAt.isAfter(modificationDeadline)
            }
        } else {
            false
        }

        existing.forEach { r ->
            // Auto archiving if the last existing result is not modifiable
            // or if the last is modifiable and the element is not the last one
            if ((!modifiable || (modifiable && r != last)) && !r.isArchived) {
                r.archivedAt = ZonedDateTime.now()
                r.archivedBy = signer
            }
        }

        val newThread = dto.comment?.let { commentService.createThread(CommentType.STAFF_ONLY, it, signer.person) }

        return if (last != null && modifiable) {
            // If a last result exists and is modifiable, change existing last result
            // and return it
            last.signedAt = now
            last.result = dto.result
            last.archivedBy = null
            last.archivedAt = null
            if (last.commentThread != null) {
                // Delete old thread first
                val oldThread = last.commentThread!!
                last.commentThread = null
                commentService.deleteCommentsThread(oldThread)
            }
            last.commentThread = newThread

            last
        } else {
            // Return existing result otherwise
            val assignment = assignmentService.getAssignmentById(dto.assignmentId)
            val result = SignOffResult(student, assignment, dto.result, signer, newThread)
            signOffResultRepository.save(result)
        }
    }

    private fun archiveSignOffs(dtos: List<SignOffResultArchiveDto>, courseId: Long) {
        val archiver = participantService.getCurrentParticipationInCourse(courseId)

        dtos.forEach { dto ->
            val existing = getSignOffResultById(dto.id)
            if (existing.isArchived) {
                throw AlreadyArchivedException()
            }
            existing.archivedBy = archiver
            existing.archivedAt = ZonedDateTime.now()
            if (dto.comment != null) {
                val comment = commentService.createThread(CommentType.STAFF_ONLY, dto.comment, archiver.person)
                existing.commentThread = comment
            }
        }
    }

    fun addThreadToSignOffResult(result: SignOffResult, thread: CommentThread) {
        if (result.commentThread == null) {
            result.commentThread = thread
        } else {
            throw ExistingThreadException()
        }
    }

    fun deleteSignOffResult(result: SignOffResult) {
        // Delete associations
        if (result.commentThread != null) {
            commentService.deleteCommentsThread(result.commentThread!!)
        }

        signOffResultRepository.delete(result)
    }
}