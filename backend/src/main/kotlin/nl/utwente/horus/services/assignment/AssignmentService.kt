package nl.utwente.horus.services.assignment

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.AssignmentRepository
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.AssignmentSetRepository
import nl.utwente.horus.entities.assignmentgroupmapping.AssignmentGroupSetsMapping
import nl.utwente.horus.entities.assignmentgroupmapping.AssignmentGroupSetsMappingRepository
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.exceptions.InvalidAssignmentCreateRequestException
import nl.utwente.horus.exceptions.InvalidAssignmentUpdateRequestException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Transactional
@Component
class AssignmentService {
    @Autowired
    lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    lateinit var assignmentSetRepository: AssignmentSetRepository

    @Autowired
    lateinit var assignmentGroupSetsMappingRepository: AssignmentGroupSetsMappingRepository

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var participantService: ParticipantService

    fun getAssignmentSetById(id: Long) : AssignmentSet {
        return assignmentSetRepository.findByIdOrNull(id) ?: throw AssignmentSetNotFoundException()
    }

    fun getAssignmentGroupSetsMappingsInCourse(courseId: Long) : List<AssignmentGroupSetsMapping> {
        return assignmentGroupSetsMappingRepository
                .findMappingsInCourse(courseService.getCourseById(courseId))
    }

    fun createAssignmentSet(creator: Participant, course: Course, dto: AssignmentSetCreateDto): AssignmentSet {
        if (dto.name.trim().isEmpty()) {
            throw InvalidAssignmentCreateRequestException("Assignment set name too short")
        }

        val assignmentSet = AssignmentSet(course, dto.name, creator)

        assignmentSetRepository.save(assignmentSet)

        return assignmentSet
    }

    fun updateAssignmentSet(creator: Person, id: Long, dto: AssignmentSetUpdateDto): AssignmentSet {
        val assignmentSet = assignmentSetRepository.findByIdOrNull(id) ?: throw AssignmentSetNotFoundException()
        val participant = participantService.getParticipationInCourse(creator, assignmentSet.course.id)
        if (dto.name.trim().isEmpty()) {
            throw InvalidAssignmentUpdateRequestException("Assignment set name too short")
        }

        assignmentSet.name = dto.name

        if (dto.assignments != null) {
            val deletionIdSet: Set<Long> = HashSet(assignmentSet.assignments.map { a -> a.id } - dto.assignments.filter { a -> a.id != null }.map { a -> a.id!! })
            val deletionSet = assignmentSet.assignments.filter { a -> deletionIdSet.contains(a.id) }
            assignmentSet.assignments.removeAll(deletionSet)

            val idAssignmentMap = HashMap<Long, Assignment>()
            assignmentSet.assignments.forEach { a -> idAssignmentMap[a.id] = a }

            dto.assignments.forEach { a ->
                if (a.id == null) {
                    val assignment = Assignment(assignmentSet, a.name, participant, a.orderKey)
                    assignmentRepository.save(assignment)
                    assignmentSet.assignments.add(assignment)
                } else {
                    idAssignmentMap[a.id]!!.name = a.name
                    idAssignmentMap[a.id]!!.orderKey = a.orderKey
                }
            }
        }

        return assignmentSet
    }

}