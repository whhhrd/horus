package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.course.Course
import javax.persistence.*

@Entity
data class Label(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val course: Course,

        var name: String,

        var color: String
) {
    constructor(course: Course, name: String, color: String) : this(0, course, name, color)

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "id.label", cascade = [CascadeType.ALL], orphanRemoval = true)
    val participantMappings: MutableSet<ParticipantLabelMapping> = HashSet()

    val participants
        get() = participantMappings.map { it.participant }

}