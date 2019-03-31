package nl.utwente.horus.representations.queuing.updates

class DequeueDto: UpdateDto {

    val queueId: String
    val participantId: Long

    constructor(roomCode: String, queueId: String, participantId: Long) : super(UpdateType.DEQUEUE, roomCode) {
        this.queueId = queueId
        this.participantId = participantId
    }
}