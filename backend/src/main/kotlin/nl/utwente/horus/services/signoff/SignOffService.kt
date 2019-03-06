package nl.utwente.horus.services.signoff

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultRepository
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.AlreadyArchivedException
import nl.utwente.horus.exceptions.DifferentAssignmentSetException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.exceptions.SignOffResultNotFoundException
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

    fun getSignOffResultById(id: Long): SignOffResult {
        return signOffResultRepository.findByIdOrNull(id) ?: throw SignOffResultNotFoundException()
    }

    fun getSignOffResults(group: Group, assignmentSet: AssignmentSet): List<SignOffResult> {
        return signOffResultRepository.getAllByGroupAndAssignmentSet(group.id, assignmentSet.id)
    }

    fun doAssignmentsHaveSignOffResults(ids: List<Long>): Boolean {
        return signOffResultRepository.existsByAssignment(ids)
    }

    fun getAssignmentSignOffResults(assignment: Assignment): List<SignOffResult> {
        return signOffResultRepository.getAssignmentSignOffResultByAssignment(assignment)
    }

    fun processSignOffs(dto: SignOffResultPatchDto, setId: Long): List<SignOffResult> {
        val assignmentSet = assignmentService.getAssignmentSetById(setId)
        // Verify that all assignments belong to this course
        val ids = dto.create.map { it.assignmentId } + dto.delete.map { it.id }
        val assignments = assignmentService.getAssignmentsByIds(ids)

        if (assignments.any { it.assignmentSet.id != assignmentSet.id }) {
            throw DifferentAssignmentSetException()
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
        val student = participantService.getParticipantById(dto.participantId)
        if (student.course.id != signer.course.id) {
            throw ParticipantNotFoundException()
        }
        // Archive older results if necessary
        val existing = signOffResultRepository.getAllByParticipantIdAndAssignmentIdAndArchivedByIsNull(dto.participantId, dto.assignmentId)
        existing.forEach { r ->
            r.archivedAt = ZonedDateTime.now()
            r.archivedBy = signer
        }
        val assignment = assignmentService.getAssignmentById(dto.assignmentId)
        val thread = if (dto.comment == null) null else
            commentService.createThread(CommentType.STAFF_ONLY, dto.comment, signer.person)
        val result = SignOffResult(student, assignment, dto.result, signer, thread)
        return signOffResultRepository.save(result)
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

    fun deleteSignOffResult(result: SignOffResult) {
        // Delete associations
        if (result.commentThread != null) {
            commentService.deleteCommentsThread(result.commentThread!!)
        }

        signOffResultRepository.delete(result)
    }
}