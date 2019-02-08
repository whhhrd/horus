package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentThread
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

        @OneToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "comment_thread_id")
        var commentThread: CommentThread?,

        var orderKey: String,

        @ManyToOne
        val createdBy: Participant,

        val createdAt: ZonedDateTime
) {

        constructor(assignmentSet: AssignmentSet, name: String, createdBy: Participant, orderKey: String): this(0, assignmentSet, name, null, orderKey, createdBy, ZonedDateTime.now())
}