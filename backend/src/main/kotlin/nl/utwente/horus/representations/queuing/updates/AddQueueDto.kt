package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.QueueDto

class AddQueueDto: UpdateDto {

    val queue: QueueDto

    constructor(roomCode: String, queue: QueueDto) : super(UpdateType.ADD_QUEUE, roomCode) {
        this.queue = queue
    }
}