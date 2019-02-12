package nl.utwente.horus.representations.person

import nl.utwente.horus.entities.person.Person
import java.time.ZonedDateTime

open class PersonDtoBrief {
    val id: Long
    val loginId: String
    val fullName: String
    val shortName: String
    val email: String?
    val createdAt: ZonedDateTime

    constructor(id: Long, loginId: String, fullName: String, shortName: String, email: String?, createdAt: ZonedDateTime) {
        this.id = id
        this.loginId = loginId
        this.fullName = fullName
        this.shortName = shortName
        this.email = email
        this.createdAt = createdAt
    }

    constructor(person: Person) : this(person.id, person.loginId, person.fullName, person.shortName, person.email, person.createdAt)
}