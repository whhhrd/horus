package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.GroupSet
import java.time.ZonedDateTime

open class GroupSetDtoBrief {
    val id: Long
    val externalId: String?
    val name: String
    val createdAt: ZonedDateTime

    constructor(id: Long, externalId: String?, name: String, createdAt: ZonedDateTime) {
        this.id = id
        this.externalId = externalId
        this.name = name
        this.createdAt = createdAt
    }

    constructor(gs: GroupSet) : this(gs.id, gs.externalId, gs.name, gs.createdAt)
}