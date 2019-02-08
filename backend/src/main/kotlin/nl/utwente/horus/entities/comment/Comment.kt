package nl.utwente.horus.entities.comment

import nl.utwente.horus.entities.person.Person
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class Comment (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val person: Person,

        @ManyToOne
        val thread: CommentThread,

        var content: String,

        val createdAt: ZonedDateTime,

        var lastEditedAt: ZonedDateTime

) {

    constructor(person: Person, thread: CommentThread, content: String): this(0, person, thread, content, ZonedDateTime.now(), ZonedDateTime.now()) {
        this.lastEditedAt = this.createdAt
    }
}