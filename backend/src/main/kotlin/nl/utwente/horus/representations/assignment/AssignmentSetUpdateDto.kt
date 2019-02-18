package nl.utwente.horus.representations.assignment

data class AssignmentSetUpdateDto (
    val name: String,
    val assignments: List<AssignmentCreateUpdateDto>?
)