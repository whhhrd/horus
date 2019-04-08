package nl.utwente.horus.entities.comment

import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
class Comment (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        @JoinColumn(name = "author")
        val author: Participant,

        @ManyToOne
        val thread: CommentThread,

        var content: String,

        val createdAt: ZonedDateTime,

        var lastEditedAt: ZonedDateTime

) {

    constructor(author: Participant, thread: CommentThread, content: String): this(0, author, thread, content, ZonedDateTime.now(), ZonedDateTime.now()) {
        this.lastEditedAt = this.createdAt
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Participant

        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

}