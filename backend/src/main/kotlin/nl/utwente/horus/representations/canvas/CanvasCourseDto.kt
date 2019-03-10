package nl.utwente.horus.representations.canvas

import java.time.ZonedDateTime

data class CanvasCourseDto(
        val canvasId: Int,
        val courseCode: String,
        val name: String,
        val studentCount: Int,
        val startAt: ZonedDateTime?
)