package nl.utwente.horus.representations.comment

import nl.utwente.horus.entities.comment.CommentType

data class CommentThreadCreateDto(
        val type: CommentType,
        val content: String
)