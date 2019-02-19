package nl.utwente.horus.representations.course

data class CourseCreateDto (
        val name: String,
        val courseCode: String?,
        val externalId: String?
)