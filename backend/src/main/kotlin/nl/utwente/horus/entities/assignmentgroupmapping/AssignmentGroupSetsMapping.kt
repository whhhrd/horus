package nl.utwente.horus.entities.assignmentgroupmapping

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.group.GroupSet
import java.io.Serializable
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.ManyToOne

@Entity
data class AssignmentGroupSetsMapping(
    @EmbeddedId
    private val id: AssignmentGroupMappingId
) {
    @Embeddable
    data class AssignmentGroupMappingId(
            @ManyToOne
            val assignmentSet: Assignment,

            @ManyToOne
            val groupSet: GroupSet
    ): Serializable

    constructor(assignmentSet: Assignment, groupSet: GroupSet): this(AssignmentGroupMappingId(assignmentSet, groupSet))

    val assignmentSet
        get() = this.id.assignmentSet

    val groupSet
        get() = this.id.groupSet
}