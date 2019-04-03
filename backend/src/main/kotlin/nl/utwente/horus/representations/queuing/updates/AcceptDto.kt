package nl.utwente.horus.representations.queuing.updates

import nl.utwente.horus.representations.queuing.ParticipantDto
import nl.utwente.horus.representations.queuing.QueueParticipantDto

class AcceptDto: UpdateDto {

    val queueId: String
    val assignmentSetId: Long?
    val groupId: Long?
    val participant: QueueParticipantDto
    val accepter: ParticipantDto

    constructor(roomCode: String, queueId: String, assignmentSetId: Long?, groupId: Long?, participant: QueueParticipantDto, accepter: ParticipantDto) : super(UpdateType.ACCEPT, roomCode) {
        this.queueId = queueId
        this.participant = participant
        this.accepter = accepter
        this.assignmentSetId = assignmentSetId
        this.groupId = groupId
    }
}