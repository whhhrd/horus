package nl.utwente.horus.entities.course

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.group.GroupSet
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class Course (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        var courseCode: String?,

        val externalId: String?,

        var name: String,

        var archived: Boolean,

        val createdAt: ZonedDateTime,

        var archivedAt: ZonedDateTime?
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    val participants: MutableSet<Participant> = HashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    val assignmentSets: MutableSet<AssignmentSet> = HashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    val groupSets: MutableSet<GroupSet> = HashSet()

    constructor(courseCode: String?, externalId: String?, name: String): this(0, courseCode, externalId, name, false, ZonedDateTime.now(), null)
}