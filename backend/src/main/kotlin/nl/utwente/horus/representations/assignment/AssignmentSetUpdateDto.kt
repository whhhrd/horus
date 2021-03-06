package nl.utwente.horus.representations.assignment

data class AssignmentSetUpdateDto (
    val name: String,
    val groupSetIds: List<Long>,
    val assignments: List<AssignmentCreateUpdateDto>?
)