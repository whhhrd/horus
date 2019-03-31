package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.ParticipantDto

class EnqueueDto: UpdateDto {

    val queueId: String
    val participant: ParticipantDto

    constructor(roomCode: String, queueId: String, participant: ParticipantDto) : super(UpdateType.ENQUEUE, roomCode) {
        this.queueId = queueId
        this.participant = participant
    }
}