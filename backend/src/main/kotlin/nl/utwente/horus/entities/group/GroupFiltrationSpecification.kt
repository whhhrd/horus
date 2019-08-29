package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignmentgroupmapping.AssignmentGroupSetsMapping
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.participant.ParticipantLabelMapping
import nl.utwente.horus.representations.dsl.LabelQueryNodeDto
import nl.utwente.horus.representations.dsl.OperatorQueryNodeDto
import nl.utwente.horus.representations.dsl.QueryNodeDto
import org.springframework.data.jpa.domain.Specification
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.criteria.*

class GroupFiltrationSpecification: Specification<Group> {

    private val courseId: Long

    private val groupSetId: Long?

    private val assignmentSetId: Long?

    private val labelQuery: QueryNodeDto?

    constructor(courseId: Long, groupSetId: Long?, assignmentSetId: Long?, labelQuery: QueryNodeDto?) {
        this.courseId = courseId
        this.groupSetId = groupSetId
        this.assignmentSetId = assignmentSetId
        this.labelQuery = labelQuery
    }

    constructor(courseId: Long, groupSetId: Long?, assignmentSetId: Long?, labelIds: List<Long>, operator: LabelFilterOperator?):
            this(courseId, groupSetId, assignmentSetId, simpleLabelQueryToNode(labelIds, operator))


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

        if (labelQuery != null) {

            val groupIdsMappedToLabelsSubQuery = query.subquery(Long::class.java)

            val subRoot = groupIdsMappedToLabelsSubQuery.from(GroupMember::class.java)

            val participant = subRoot.get<GroupMember.GroupMemberId>("id")
                    .get<Participant>("participant")

            val participantId = participant.get<Long>("id")

            groupIdsMappedToLabelsSubQuery.select(subRoot.get<GroupMember.GroupMemberId>("id").get<Group>("group").get<Long>("id"))

            groupIdsMappedToLabelsSubQuery.where(
                    labelQueryToPredicate(labelQuery, participantId, query, criteriaBuilder),
                    criteriaBuilder.equal(participant.get<Boolean>("enabled"), true)
            )


            constraints.add(root.get<Long>("id").`in`(groupIdsMappedToLabelsSubQuery))

        }

        return criteriaBuilder.and(*constraints.toTypedArray())
    }

    private fun labelQueryToPredicate(query: QueryNodeDto, participantId: Path<Long>, criteriaQuery: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate {
        if (query is LabelQueryNodeDto) {
            val mappedParticipantIdsSubQuery = criteriaQuery.subquery(Long::class.java)
            val subRoot = mappedParticipantIdsSubQuery.from(ParticipantLabelMapping::class.java)
            mappedParticipantIdsSubQuery.select(subRoot.get<ParticipantLabelMapping.ParticipantLabelMappingId>("id")
                    .get<Participant>("participant").get<Long>("id"))
            mappedParticipantIdsSubQuery.where(
                    criteriaBuilder.equal(subRoot.get<ParticipantLabelMapping.ParticipantLabelMappingId>("id")
                    .get<Label>("label").get<Long>("id"), query.labelId))
            return participantId.`in`(mappedParticipantIdsSubQuery)
        }
        val opNode: OperatorQueryNodeDto = query as OperatorQueryNodeDto
        val childPredicates = opNode.children.map { child -> labelQueryToPredicate(child, participantId, criteriaQuery, criteriaBuilder) }
        return when (opNode.op) {
            LabelFilterOperator.NOT -> {
                criteriaBuilder.not(childPredicates.first())
            }
            LabelFilterOperator.AND -> {
                criteriaBuilder.and(*childPredicates.toTypedArray())
            }
            LabelFilterOperator.OR -> {
                criteriaBuilder.or(*childPredicates.toTypedArray())
            }
        }
    }

    companion object {
        private fun simpleLabelQueryToNode(labelIds: List<Long>, operator: LabelFilterOperator?): QueryNodeDto? {
            return if (labelIds.isEmpty()) null
            else {
                when (val labelFilterOperator = operator ?: LabelFilterOperator.AND) {
                    LabelFilterOperator.NOT -> {
                        OperatorQueryNodeDto(
                                LabelFilterOperator.NOT,
                                Collections.singletonList(
                                        OperatorQueryNodeDto(
                                                LabelFilterOperator.OR,
                                                labelIds.map { id -> LabelQueryNodeDto(id) }
                                        )
                                )
                        )
                    }
                    LabelFilterOperator.AND, LabelFilterOperator.OR -> {
                        OperatorQueryNodeDto(labelFilterOperator, labelIds.map { id -> LabelQueryNodeDto(id) })
                    }
                }
            }
        }
    }
}