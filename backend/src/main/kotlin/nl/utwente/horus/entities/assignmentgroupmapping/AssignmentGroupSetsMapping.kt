package nl.utwente.horus.entities.assignmentgroupmapping

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.group.GroupSet
import java.io.Serializable
import javax.persistence.*

@Entity
@Table(name = "assignment_group_sets_mapping")
data class AssignmentGroupSetsMapping(
    @EmbeddedId
    private val id: AssignmentGroupMappingId
) {
    @Embeddable
    data class AssignmentGroupMappingId(
            @ManyToOne
            val assignmentSet: AssignmentSet,

            @ManyToOne
            val groupSet: GroupSet
    ): Serializable

    constructor(assignmentSet: AssignmentSet, groupSet: GroupSet): this(AssignmentGroupMappingId(assignmentSet, groupSet))

    val assignmentSet
        get() = this.id.assignmentSet

    val groupSet
        get() = this.id.groupSet
}