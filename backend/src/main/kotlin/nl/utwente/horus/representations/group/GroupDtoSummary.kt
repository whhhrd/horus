package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDtoFull

open class GroupDtoSummary : GroupDtoBrief {
    val groupSet: GroupSetDtoBrief
    val commentThread: CommentThreadDtoBrief?
    val createdBy: ParticipantDtoFull

    constructor(g: Group) : super(g) {
        this.groupSet = GroupSetDtoBrief(g.groupSet)
        this.commentThread = g.commentThread?.let { CommentThreadDtoBrief(it) }
        this.createdBy = ParticipantDtoFull(g.createdBy)
    }
}