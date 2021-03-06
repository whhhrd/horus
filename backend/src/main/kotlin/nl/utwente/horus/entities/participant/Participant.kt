package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.auth.ParticipantSupplementaryRoleMapping
import nl.utwente.horus.entities.auth.Role
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.person.Person
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
class Participant (

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val person: Person,

        @ManyToOne
        val course: Course,

        @ManyToOne
        var role: Role,

        @OneToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "comment_thread_id")
        var commentThread: CommentThread?,

        var enabled: Boolean,

        val createdAt: ZonedDateTime,

        var hidden: Boolean

) {
        constructor(person: Person, course: Course, role: Role) : this(0, person, course, role, null,true, ZonedDateTime.now(), false)

        @OneToMany(fetch = FetchType.LAZY, mappedBy = "id.participant", cascade = [CascadeType.ALL], orphanRemoval = true)
        val labelMappings: MutableSet<ParticipantLabelMapping> = HashSet()

        @OneToMany(mappedBy = "id.participant", cascade = [CascadeType.ALL], orphanRemoval = true)
        val supplementaryRoleMappings: MutableSet<ParticipantSupplementaryRoleMapping> = HashSet()

        val labels
                get() = labelMappings.map { it.label }.sortedBy { it.name }

        val supplementaryRoles
                get() = supplementaryRoleMappings.map { it.supplementaryRole }.sortedBy { it.id }

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