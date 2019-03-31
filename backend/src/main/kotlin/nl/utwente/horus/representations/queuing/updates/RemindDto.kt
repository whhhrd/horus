package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.ParticipantDto

class RemindDto: UpdateDto {

    val participant: ParticipantDto

    constructor(roomCode: String, participant: ParticipantDto) : super(UpdateType.REMIND, roomCode) {
        this.participant = participant
    }
}