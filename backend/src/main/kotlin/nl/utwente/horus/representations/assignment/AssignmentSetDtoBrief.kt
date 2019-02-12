package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet
import java.time.ZonedDateTime

open class AssignmentSetDtoBrief  {
    val id: Long
    val name: String
    val createdAt: ZonedDateTime

    constructor(id: Long, name: String, createdAt: ZonedDateTime) {
        this.id = id
        this.name = name
        this.createdAt = createdAt
    }

    constructor(assignmentSet: AssignmentSet) : this(assignmentSet.id, assignmentSet.name, assignmentSet.createdAt)
}