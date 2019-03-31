package nl.utwente.horus.representations.queuing.updates

class CloseRoomDto: UpdateDto {

    constructor(roomCode: String) : super(UpdateType.CLOSE_ROOM, roomCode)
}