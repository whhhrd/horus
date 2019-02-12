package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class GroupSet (

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        var externalId: String?,

        @ManyToOne
        val course: Course,

        var name: String,

        @ManyToOne
        @JoinColumn(name="created_by")
        val createdBy: Participant,

        val createdAt: ZonedDateTime

) {
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "groupSet", cascade = [CascadeType.ALL], orphanRemoval = true)
    val groups: MutableSet<Group> = HashSet()

    constructor(externalId: String?, course: Course, name: String, createdBy: Participant): this(0, externalId, course, name, createdBy, ZonedDateTime.now())
}