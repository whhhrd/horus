package nl.utwente.horus.representations.comment

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.comment.CommentType

open class CommentThreadDtoBrief {
    val id: Long
    val type: CommentType

    constructor(id: Long, type: CommentType) {
        this.id = id
        this.type = type
    }

    constructor(commentThread: CommentThread) : this(commentThread.id, commentThread.type)
}