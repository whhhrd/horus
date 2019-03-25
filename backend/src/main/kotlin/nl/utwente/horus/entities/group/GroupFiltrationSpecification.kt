package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignmentgroupmapping.AssignmentGroupSetsMapping
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.participant.ParticipantLabelMapping
import org.springframework.data.jpa.domain.Specification
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.criteria.*

class GroupFiltrationSpecification: Specification<Group> {

    private val courseId: Long

    private val groupSetId: Long?

    private val assignmentSetId: Long?

    private val labelIds: List<Long>

    enum class LabelFilterOperator {
        AND,
        OR
    }

    private val labelFilterOperator: GroupFiltrationSpecification.LabelFilterOperator

    constructor(courseId: Long, groupSetId: Long?, assignmentSetId: Long?, labelIds: List<Long>, operator: LabelFilterOperator?) {
        this.courseId = courseId
        this.groupSetId = groupSetId
        this.assignmentSetId = assignmentSetId
        this.labelIds = labelIds
        this.labelFilterOperator = operator ?: LabelFilterOperator.AND
    }


    override fun toPredicate(root: Root<Group>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
        val constraints = LinkedList<Predicate>()

        constraints.push(criteriaBuilder.isNull(root.get<ZonedDateTime?>("archivedAt")))

        val groupSetJoin = root.join<Group, GroupSet>("groupSet")
        if (groupSetId != null) {
            constraints.push(criteriaBuilder.equal(groupSetJoin.get<Long>("id"), groupSetId))
        }

        val courseJoin = groupSetJoin.join<GroupSet, Course>("course")
        constraints.push(criteriaBuilder.equal(courseJoin.get<Long>("id"), courseId))

        if (assignmentSetId != null) {
            val groupSetIdsMappedToAssignmentSetSubQuery = query.subquery(Long::class.java)

            val subRoot = groupSetIdsMappedToAssignmentSetSubQuery.from(AssignmentGroupSetsMapping::class.java)

            val mappingIdField = subRoot.get<AssignmentGroupSetsMapping.AssignmentGroupMappingId>("id")

            val assignmentSet = mappingIdField.get<AssignmentSet>("assignmentSet")

            val groupSet = mappingIdField.get<GroupSet>("groupSet")

            groupSetIdsMappedToAssignmentSetSubQuery.where(criteriaBuilder.equal(assignmentSet.get<Long>("id"), assignmentSetId))

            groupSetIdsMappedToAssignmentSetSubQuery.select(groupSet.get<Long>("id"))

            constraints.add(root.get<Long>("groupSet").get<Long>("id").`in`(groupSetIdsMappedToAssignmentSetSubQuery))
        }

        if (labelIds.isNotEmpty()) {

            val groupIdsMappedToLabelsSubQuery = query.subquery(Long::class.java)

            val subRoot = groupIdsMappedToLabelsSubQuery.from(GroupMember::class.java)

            val participant = subRoot.get<GroupMember.GroupMemberId>("id")
                    .get<Participant>("participant")

            val labelMappingRoot = groupIdsMappedToLabelsSubQuery.from(ParticipantLabelMapping::class.java)

            val labelId = labelMappingRoot
                    .get<ParticipantLabelMapping.ParticipantLabelMappingId>("id")
                    .get<Label>("label").get<Long>("id")

            val labelledParticipant = labelMappingRoot
                    .get<ParticipantLabelMapping.ParticipantLabelMappingId>("id")
                    .get<Participant>("participant")

            groupIdsMappedToLabelsSubQuery.select(subRoot.get<GroupMember.GroupMemberId>("id").get<Group>("group").get<Long>("id"))

            groupIdsMappedToLabelsSubQuery.where(labelId.`in`(labelIds), criteriaBuilder.equal(participant.get<Boolean>("enabled"), true), criteriaBuilder.equal(participant.get<Long>("id"), labelledParticipant.get<Long>("id")))

            when {
                labelFilterOperator == LabelFilterOperator.AND -> {
                    groupIdsMappedToLabelsSubQuery.groupBy(subRoot)
                    groupIdsMappedToLabelsSubQuery.having(criteriaBuilder.equal(criteriaBuilder.count(subRoot), labelIds.size))
                }
            }

            constraints.add(root.get<Long>("id").`in`(groupIdsMappedToLabelsSubQuery))

        }

        return criteriaBuilder.and(*constraints.toTypedArray())
    }
}