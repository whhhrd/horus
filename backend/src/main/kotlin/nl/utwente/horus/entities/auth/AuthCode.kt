package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.person.Person
import java.time.ZonedDateTime
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne

@Entity
data class AuthCode (
        @Id
        val code: String,

        @ManyToOne
        val person: Person,

        val createdAt: ZonedDateTime
) {
        constructor(code: String, person: Person): this(code, person, ZonedDateTime.now())
}