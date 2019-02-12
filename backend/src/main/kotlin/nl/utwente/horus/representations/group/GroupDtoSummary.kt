package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDto

open class GroupDtoSummary : GroupDtoBrief {
    val groupSet: GroupSetDtoBrief
    val commentThread: CommentThreadDtoBrief?
    val createdBy: ParticipantDto

    constructor(g: Group) : super(g) {
        this.groupSet = GroupSetDtoBrief(g.groupSet)
        this.commentThread = g.commentThread?.let { CommentThreadDtoBrief(it) }
        this.createdBy = ParticipantDto(g.createdBy)
    }
}