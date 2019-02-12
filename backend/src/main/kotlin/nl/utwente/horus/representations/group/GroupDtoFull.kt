package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.participant.ParticipantDto

class GroupDtoFull : GroupDtoSummary {
    val participants: MutableSet<ParticipantDto>

    constructor(g: Group) : super(g) {
        this.participants = g.participants.map { ParticipantDto(it) }.toMutableSet()
    }
}