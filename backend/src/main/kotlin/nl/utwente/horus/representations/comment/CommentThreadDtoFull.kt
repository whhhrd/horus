package nl.utwente.horus.representations.comment

import nl.utwente.horus.entities.comment.CommentThread

class CommentThreadDtoFull : CommentThreadDtoBrief {
    val comments: MutableSet<CommentDto>

    constructor(commentThread: CommentThread) : super(commentThread) {
        this.comments = commentThread.comments.map { CommentDto(it) }.toMutableSet()
    }
}