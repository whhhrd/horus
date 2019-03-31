package nl.utwente.horus.representations.queuing.updates

abstract class UpdateDto {
    val type: UpdateType
    val roomCode: String

    constructor(type: UpdateType, roomCode: String) {
        this.type = type
        this.roomCode = roomCode
    }
}