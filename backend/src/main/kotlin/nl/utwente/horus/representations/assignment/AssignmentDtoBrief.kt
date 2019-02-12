package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.Assignment
import java.time.ZonedDateTime

open class AssignmentDtoBrief {
    val id: Long
    val name: String
    val orderKey: String
    val createdAt: ZonedDateTime

    constructor(id: Long, name: String, orderKey: String, createdAt: ZonedDateTime) {
        this.id = id
        this.name = name
        this.orderKey = orderKey
        this.createdAt = createdAt
    }

    constructor(a: Assignment) : this(a.id, a.name, a.orderKey, a.createdAt)
}