package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.participant.ParticipantDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDtoFull

class GroupDtoFull : GroupDtoSummary {
    val participants: MutableSet<ParticipantDtoBrief>

    constructor(g: Group) : super(g) {
        this.participants = g.participants.map { ParticipantDtoBrief(it) }.toMutableSet()
    }
}