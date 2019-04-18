package nl.utwente.horus.entities.course

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
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

        val createdAt: ZonedDateTime,

        var archivedAt: ZonedDateTime?
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val participants: MutableSet<Participant> = HashSet()

    val enabledParticipants
        get() = participants.filter { it.enabled }

    val disabledParticipants
        get() = participants.filter { !it.enabled }

    val enabledAndDisabledParticipants
        get() = enabledParticipants + disabledParticipants

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("id ASC")
    val labels: MutableSet<Label> = HashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("id ASC")
    val assignmentSets: MutableSet<AssignmentSet> = HashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("id ASC")
    val groupSets: MutableSet<GroupSet> = HashSet()

    val archived
        get() = archivedAt != null

    constructor(courseCode: String?, externalId: String?, name: String): this(0, courseCode, externalId, name, ZonedDateTime.now(), null)

    fun addParticipant(participant: Participant) {
        participants.add(participant)
    }
}