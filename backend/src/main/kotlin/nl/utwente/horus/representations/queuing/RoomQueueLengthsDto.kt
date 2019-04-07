package nl.utwente.horus.representations.queuing

data class RoomQueueLengthsDto(
        val room: RoomDto,
        val queues: List<QueueLengthDto>
)

data class QueueLengthDto(
        val name: String,
        val length: Int
)