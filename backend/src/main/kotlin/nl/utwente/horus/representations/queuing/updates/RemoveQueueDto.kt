package nl.utwente.horus.representations.queuing.updates

class RemoveQueueDto: UpdateDto {

    val queueId: String

    constructor(roomCode: String, queueId: String) : super(UpdateType.REMOVE_QUEUE, roomCode) {
        this.queueId = queueId
    }
}