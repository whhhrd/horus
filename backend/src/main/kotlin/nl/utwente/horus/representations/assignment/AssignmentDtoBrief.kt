package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.Assignment
import java.time.ZonedDateTime

open class AssignmentDtoBrief {
    val id: Long
    val name: String
    val createdAt: ZonedDateTime

    constructor(id: Long, name: String, createdAt: ZonedDateTime) {
        this.id = id
        this.name = name
        this.createdAt = createdAt
    }

    constructor(a: Assignment) : this(a.id, a.name, a.createdAt)
}