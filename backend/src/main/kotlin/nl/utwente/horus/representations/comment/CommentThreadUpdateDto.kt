package nl.utwente.horus.representations.comment

import nl.utwente.horus.entities.comment.CommentType

data class CommentThreadUpdateDto(
        val type: CommentType
)