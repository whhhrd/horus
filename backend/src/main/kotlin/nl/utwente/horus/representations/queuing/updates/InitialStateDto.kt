package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.AnnouncementDto
import nl.utwente.horus.representations.queuing.QueueDto
import nl.utwente.horus.representations.queuing.RoomDto

class InitialStateDto: UpdateDto {
    val room: RoomDto
    val queues: List<QueueDto>
    val announcements: List<AnnouncementDto>
    val history: List<AcceptDto>

    constructor(roomCode: String, room: RoomDto, queues: List<QueueDto>, announcements: List<AnnouncementDto>, history: List<AcceptDto>) : super(UpdateType.INITIAL, roomCode) {
        this.room = room
        this.queues = queues
        this.announcements = announcements
        this.history = history
    }
}
