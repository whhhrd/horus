package nl.utwente.horus.representations.queuing.updates

class RemoveAnnouncementDto: UpdateDto {

    val announcementId: String

    constructor(roomCode: String, announcementId: String) : super(UpdateType.REMOVE_ANNOUNCEMENT, roomCode) {
        this.announcementId = announcementId
    }
}