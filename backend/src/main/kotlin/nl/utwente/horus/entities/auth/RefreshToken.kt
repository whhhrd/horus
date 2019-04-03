package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.person.Person
import java.time.ZonedDateTime
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne

@Entity
data class RefreshToken (
        @Id
        val id: String,

        @ManyToOne
        val person: Person,

        val clientId: String?,

        val issuedAt: ZonedDateTime,

        val expiresAt: ZonedDateTime,

        var lastUsedAt: ZonedDateTime
)