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
import nl.utwente.horus.exceptions.InvalidAssignmentGroupSetsMappingCreateRequestException
import nl.utwente.horus.exceptions.InvalidAssignmentUpdateRequestException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
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
    lateinit var groupService: GroupService

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
        // Update included assignments
        if (dto.assignments != null) {
            val deletionIdSet: Set<Long> = HashSet(assignmentSet.assignments.map { a -> a.id } - dto.assignments.filter { a -> a.id != null }.map { a -> a.id!! })
            val deletionSet = assignmentSet.assignments.filter { a -> deletionIdSet.contains(a.id) }
            assignmentSet.assignments.removeAll(deletionSet)

            val idAssignmentMap = HashMap<Long, Assignment>()
            assignmentSet.assignments.forEach { a -> idAssignmentMap[a.id] = a }

            for ((index, a) in dto.assignments.withIndex()) {
                if (a.id == null) {
                    val assignment = Assignment(assignmentSet, a.name, participant, index.toLong())
                    assignmentRepository.save(assignment)
                    assignmentSet.assignments.add(assignment)
                } else {
                    val existing = idAssignmentMap[a.id] ?: throw InvalidAssignmentUpdateRequestException("Assignment with ID " +
                            "${a.id} was requested to be updated, but the original does not exist in the set.")
                    existing.name = a.name
                    existing.orderKey = index.toLong()
                }
            }
        }

        // Update related group sets
        val existing = assignmentSet.groupSetMappings
        val dtoGroupIds = dto.groupSetIds.toSet()

        // Remove mappings for "deleted" associations
        existing.filter { !dtoGroupIds.contains(it.groupSet.id) }.forEach {mapping ->
            mapping.assignmentSet.groupSetMappings.remove(mapping)
            mapping.groupSet.assignmentSetMappings.remove(mapping)
            assignmentGroupSetsMappingRepository.delete(mapping)
        }

        // Add mappings which are "new"
        val existingIds = existing.map { it.groupSet.id }.toSet()
        (dtoGroupIds - existingIds).forEach {newGroupId ->
            val groupSet = groupService.getGroupSetById(newGroupId)
            if (groupSet.course.id != assignmentSet.course.id) {
                throw InvalidAssignmentGroupSetsMappingCreateRequestException("GroupSet ID $newGroupId does not belong to the same course as the assignment set requested to update.")
            }
            val mapping = assignmentGroupSetsMappingRepository.save(AssignmentGroupSetsMapping(assignmentSet, groupSet))
            groupSet.assignmentSetMappings.add(mapping)
            assignmentSet.groupSetMappings.add(mapping)
        }

        return assignmentSet
    }

}