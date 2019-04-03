package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.QueueParticipantDto

class EnqueueDto: UpdateDto {

    val queueId: String
    val participant: QueueParticipantDto

    constructor(roomCode: String, queueId: String, participant: QueueParticipantDto) : super(UpdateType.ENQUEUE, roomCode) {
        this.queueId = queueId
        this.participant = participant
    }
}