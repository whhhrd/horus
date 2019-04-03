package nl.utwente.horus.representations.queuing

import java.time.ZonedDateTime

class QueueParticipantDto: ParticipantDto {

    val addedAt: ZonedDateTime

    constructor(id: Long, fullName: String, addedAt: ZonedDateTime): super(id, fullName) {
        this.addedAt = addedAt
    }
}