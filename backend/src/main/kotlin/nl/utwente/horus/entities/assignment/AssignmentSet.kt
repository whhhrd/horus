package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class AssignmentSet (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val course: Course,

        var name: String,

        @ManyToOne
        @JoinColumn(name="created_by")
        val createdBy: Participant,

        val createdAt: ZonedDateTime

) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "assignmentSet", cascade = [CascadeType.ALL], orphanRemoval = true)
    val assignments: MutableSet<Assignment> = HashSet()

    constructor(course: Course, name: String, createdBy: Participant): this(0, course, name, createdBy, ZonedDateTime.now())
}