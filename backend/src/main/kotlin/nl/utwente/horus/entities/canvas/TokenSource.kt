package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.course.Course
import java.io.Serializable
import javax.persistence.*

@Entity
data class TokenSource(
        @EmbeddedId
        private val id: TokenSourceId
) {
    @Embeddable
    data class TokenSourceId(
            @OneToOne
            val course: Course,

            @ManyToOne
            val canvasToken: CanvasToken
    ): Serializable

    val course
        get() = id.course

    val canvasToken
        get() = id.canvasToken

    constructor(course: Course, canvasToken: CanvasToken) : this(TokenSourceId(course, canvasToken))
}