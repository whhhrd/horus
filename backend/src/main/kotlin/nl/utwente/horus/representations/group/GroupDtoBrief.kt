package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.Group
import java.time.ZonedDateTime

open class GroupDtoBrief {
    val id: Long
    val externalId: String?
    val name: String
    val createdAt: ZonedDateTime
    val archivedAt: ZonedDateTime?

    constructor(id: Long, externalId: String?, name: String, createdAt: ZonedDateTime, archivedAt: ZonedDateTime?) {
        this.id = id
        this.externalId = externalId
        this.name = name
        this.createdAt = createdAt
        this.archivedAt = archivedAt
    }

    constructor(g: Group) : this(g.id, g.externalId, g.name, g.createdAt, g.archivedAt)
}