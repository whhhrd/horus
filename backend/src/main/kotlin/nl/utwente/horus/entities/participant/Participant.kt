package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.entities.auth.Role
import nl.utwente.horus.entities.comment.Comment
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

        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_thread_id_seq")
        val commentThreadId: Long = 0,

        var enabled: Boolean,

        val createdAt: ZonedDateTime

) {
        @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        @JoinColumn(name = "threadId", referencedColumnName = "commentThreadId")
        val comments: MutableSet<Comment> = HashSet()

        constructor(person: Person, course: Course, role: Role) : this(0, person, course, role, 0,true, ZonedDateTime.now())
}