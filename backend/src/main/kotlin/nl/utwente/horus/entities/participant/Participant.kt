package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.entities.auth.Role
import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.course.Course
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class Participant (

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val person: Person,

        @ManyToOne
        val course: Course,

        @ManyToOne
        val role: Role,

        @OneToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "comment_thread_id")
        var commentThread: CommentThread?,

        var enabled: Boolean,

        val createdAt: ZonedDateTime

) {
        constructor(person: Person, course: Course, role: Role) : this(0, person, course, role, null,true, ZonedDateTime.now())
}