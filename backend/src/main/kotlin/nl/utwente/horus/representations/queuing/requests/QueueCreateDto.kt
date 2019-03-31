package nl.utwente.horus.representations.queuing.requests

data class QueueCreateDto (
        val name: String,
        val assignmentSetId: Long?
)