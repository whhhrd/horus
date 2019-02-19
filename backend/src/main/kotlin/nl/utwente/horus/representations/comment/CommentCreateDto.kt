package nl.utwente.horus.representations.comment

data class CommentCreateDto(
        val threadId: Long,
        val content: String
)