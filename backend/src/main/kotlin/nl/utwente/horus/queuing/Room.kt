package nl.utwente.horus.queuing

import nl.utwente.horus.queuing.exceptions.*
import nl.utwente.horus.representations.queuing.*
import nl.utwente.horus.representations.queuing.updates.*
import reactor.core.Disposable
import reactor.core.publisher.DirectProcessor
import reactor.core.publisher.Flux
import reactor.core.publisher.FluxProcessor
import reactor.core.publisher.FluxSink
import reactor.core.scheduler.Schedulers
import java.util.*
import java.util.concurrent.locks.ReentrantLock
import java.util.function.Consumer
import kotlin.concurrent.withLock

class Room {

    val courseId: Long
    val code: String
    var name: String

    private val queues = HashMap<String, Queue>()
    private val announcements = LinkedList<AnnouncementDto>()

    private val history = LinkedList<AcceptDto>()

    private val lock = ReentrantLock()

    private val eventProcessor: FluxProcessor<UpdateDto, UpdateDto> = DirectProcessor.create<UpdateDto>().serialize()

    private val eventSink: FluxSink<UpdateDto> = eventProcessor.sink()

    private val scheduler = Schedulers.parallel()


    constructor(courseId: Long, code: String, name: String) {
        this.courseId = courseId
        this.code = code
        this.name = name
    }

    fun toDto(): RoomDto {
        return withLock {
            RoomDto(courseId, code, name)
        }
    }

    fun close(): CloseRoomDto {
        return withLock {
            val dto = CloseRoomDto(code)
            pushUpdate(dto)
            terminateUpdates()
             dto
        }
    }

    fun addAnnouncement(announcement: String): AnnouncementDto {
        return eventEmittingActionWithLock {
            val announcement = AnnouncementDto(UUID.randomUUID().toString(), code, announcement)
            val dto = AddAnnouncementDto(code, announcement)
            announcements.add(announcement)
            Pair(announcement, dto)
        }
    }

    fun removeAnnouncement(id: String) {
        eventEmittingActionWithLock {
            val announcement = announcements.find {it.id == id} ?: throw AnnouncementNotFoundException()
            announcements.removeIf { it.id == id }
            Pair(null, RemoveAnnouncementDto(code, id))
        }
    }

    fun sendReminder(participantId: Long, fullName: String) {
        eventEmittingActionWithLock {
            val dto = RemindDto(code, ParticipantDto(participantId, fullName))
            Pair(null, dto)
        }
    }

    fun createQueue(name: String, assignmentSetId: Long?): QueueDto {
        return eventEmittingActionWithLock {
            val queue = Queue(courseId, code, name, assignmentSetId)
            queues[queue.id] = queue
            val dto = queue.toDto()
            Pair(dto, AddQueueDto(code, dto))
        }
    }

    fun deleteQueue(id: String) {
        eventEmittingActionWithLock {
            val queue = queues[id] ?: throw QueueNotFoundException()
            queues.remove(queue.id)
            Pair(null, RemoveQueueDto(code, queue.id))
        }
    }

    fun enqueueParticipant(queueId: String, participantId: Long, fullName: String, allowedAssignmentSets: List<Long>): QueueParticipantDto {
        return eventEmittingActionWithLock {
            val queue = queues[queueId] ?: throw QueueNotFoundException()
            queue.assignmentSetId?.let {
                if (!allowedAssignmentSets.contains(it)) throw ParticipantCannotBeEnqueuedForQueueException()
            }
            val participant = queue.enqueueParticipant(participantId, fullName) ?: throw ParticipantAlreadyInQueueException()
            Pair(participant.toDto(), EnqueueDto(code, queue.id, participant.toDto()))
        }
    }

    fun acceptParticipant(queueId: String, accepterId: Long, accepterFullName: String, groupIdFetchAction: (Long, Long) -> Long?): AcceptDto {
        return eventsEmittingActionWithLock {
            val queue = queues[queueId] ?: throw QueueNotFoundException()
            val participant = queue.dequeueParticipant() ?: throw ParticipantNotFoundException()
            val assignmentSetId = queue.assignmentSetId
            val groupId: Long? = assignmentSetId?.let {
                groupIdFetchAction(participant.id, it)
            }
            val dto = if (groupId != null) {
                AcceptDto(code, queueId, assignmentSetId, groupId, participant.toDto(), ParticipantDto(accepterId, accepterFullName))
            } else {
                AcceptDto(code, queueId, null, null, participant.toDto(), ParticipantDto(accepterId, accepterFullName))
            }
            appendAcceptHistory(dto)
            Pair(dto, arrayOf(DequeueDto(code, queue.id, participant.id), dto))
        }
    }

    fun acceptParticipant(queueId: String, participantId: Long, accepterId: Long, accepterFullName: String, groupIdFetchAction: (Long, Long) -> Long?): AcceptDto {
        return eventsEmittingActionWithLock {
            val queue = queues[queueId] ?: throw QueueNotFoundException()
            val participant = queue.dequeueParticipant(participantId) ?: throw ParticipantNotFoundException()
            val assignmentSetId = queue.assignmentSetId
            val groupId: Long? = assignmentSetId?.let {
                groupIdFetchAction(participantId, it)
            }
            val dto = if (groupId != null) {
                AcceptDto(code, queueId, assignmentSetId, groupId, participant.toDto(), ParticipantDto(accepterId, accepterFullName))
            } else {
                AcceptDto(code, queueId, null, null, participant.toDto(), ParticipantDto(accepterId, accepterFullName))
            }
            appendAcceptHistory(dto)
            Pair(dto, arrayOf(DequeueDto(code, queue.id, participant.id), dto))
        }
    }

    fun dequeueParticipant(queueId: String, participantId: Long): ParticipantDto {
        return eventEmittingActionWithLock {
            val queue = queues[queueId] ?: throw QueueNotFoundException()
            val participant = queue.dequeueParticipant(participantId) ?: throw ParticipantNotFoundException()
            Pair(participant.toDto(), DequeueDto(code, queue.id, participant.id))
        }
    }

    fun atomicSubscribe(preSubscribeAction: (InitialStateDto) -> Unit,
                        subscriptionConsumer: Consumer<UpdateDto>,
                        errorConsumer: Consumer<Throwable>,
                        onCompletion: Runnable): Disposable {
       return withLock {
            toStateDto()
            preSubscribeAction(toStateDto())
            getUpdateStream().subscribe(subscriptionConsumer, errorConsumer, onCompletion)
        }
    }

    private fun appendAcceptHistory(dto: AcceptDto) {
        withLock {
            while(history.size > 0) {
                history.removeLast()
            }
            history.addFirst(dto)
        }
    }

    private fun getUpdateStream(): Flux<UpdateDto> {
        return eventProcessor.publishOn(scheduler)
    }

    private fun pushUpdate(update: UpdateDto) {
        withLock {
            eventSink.next(update)
        }
    }

    private fun terminateUpdates() {
        withLock {
            eventSink.complete()
        }
    }

    private fun <T> withLock(action: () -> T): T {
        return lock.withLock(action)
    }

    private fun <T> eventsEmittingActionWithLock(action: () -> Pair<T, Array<out UpdateDto>>): T {
        return withLock {
            val out = action()
            out.second.forEach {
                pushUpdate(it)
            }
            out.first
        }
    }

    private fun <T> eventEmittingActionWithLock(action: () -> Pair<T, UpdateDto>): T {
        return eventsEmittingActionWithLock {
            val out = action()
            Pair(out.first, arrayOf(out.second))
        }
    }

    private fun toStateDto(): InitialStateDto {
        return withLock {
            InitialStateDto(code, toDto(), queues.values.map { it.toDto() }.sortedBy { it.createdAt }, announcements, history)
        }
    }
}