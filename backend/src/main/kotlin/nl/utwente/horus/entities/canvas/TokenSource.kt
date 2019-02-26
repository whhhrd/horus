package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.course.Course
import javax.persistence.*

@Entity
data class TokenSource(

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long,

        @OneToOne
        val course: Course,

        @ManyToOne
        val canvasToken: CanvasToken
) {
    constructor(course: Course, canvasToken: CanvasToken) : this(0, course, canvasToken)
}