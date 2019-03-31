package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.QueueDto

class EditQueueDto: UpdateDto {

    val queue: QueueDto

    constructor(roomCode: String, queue: QueueDto) : super(UpdateType.EDIT_QUEUE, roomCode) {
        this.queue = queue
    }
}