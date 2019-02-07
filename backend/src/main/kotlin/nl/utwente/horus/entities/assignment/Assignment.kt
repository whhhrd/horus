package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.*

@Entity
data class Assignment (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val assignmentSet: AssignmentSet,

        var name: String,

        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_thread_id_seq")
        val commentThreadId: Long = 0,

        var orderKey: String,

        @ManyToOne
        val createdBy: Participant,

        val createdAt: ZonedDateTime
) {
        @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        @JoinColumn(name = "threadId", referencedColumnName = "commentThreadId")
        val comments: MutableSet<Comment> = HashSet()

        constructor(assignmentSet: AssignmentSet, name: String, createdBy: Participant, orderKey: String): this(0, assignmentSet, name, 0, orderKey, createdBy, ZonedDateTime.now())
}