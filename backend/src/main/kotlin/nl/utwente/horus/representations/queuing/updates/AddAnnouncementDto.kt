package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.AnnouncementDto

class AddAnnouncementDto: UpdateDto {

    val announcement: AnnouncementDto

    constructor(roomCode: String, announcement: AnnouncementDto) : super(UpdateType.ADD_ANNOUNCEMENT, roomCode) {
        this.announcement = announcement
    }
}