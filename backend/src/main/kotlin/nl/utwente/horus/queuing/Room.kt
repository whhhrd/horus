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

/**
 * <code>Room</code> represents a room in the queuing sub-system.
 * The methods mutate the room state and also publish updates on the state update events sink.
 * Methods are safe for concurrent use. All new methods MUST follow this pattern if publicly exposed.
 */
class Room {

    val courseId: Long
    val code: String
    var name: String

    // queues in the room
    private val queues = HashMap<String, Queue>()

    // announcements in the room
    private val announcements = LinkedList<AnnouncementDto>()

    // history of queue acceptances
    private val history = LinkedList<AcceptDto>()

    // room lock for state modifications
    private val lock = ReentrantLock()

    // the FluxProcessor for doing the multicast of state updates
    // see https://projectreactor.io/docs/core/release/api/reactor/core/publisher/DirectProcessor.html
    private val eventProcessor: FluxProcessor<UpdateDto, UpdateDto> = DirectProcessor.create<UpdateDto>().serialize()

    // The FluxSink for pushing updates to the eventProcessor
    private val eventSink: FluxSink<UpdateDto> = eventProcessor.sink()

    // The scheduler for tasks to publish events in the sink
    private val scheduler = Schedulers.parallel()

    companion object {
        const val HISTORY_SIZE = 5
    }

    /**
     * Constructs a new room.
     * @param courseId ID of the room to create the room in.
     * @param code the code of the room.
     * @param name the name of the room.
     */
    constructor(courseId: Long, code: String, name: String) {
        this.courseId = courseId
        this.code = code
        this.name = name
    }

    /**
     * Builds the serializable DTO for the room.
     */
    fun toDto(): RoomDto {
        return withLock {
            RoomDto(courseId, code, name)
        }
    }

    /**
     * Builds the "busyness" DTO for the room.
     */
    fun toRoomQueueLengthsDto(): RoomQueueLengthsDto {
        return withLock {
            RoomQueueLengthsDto(toDto(), queues.values.map { QueueLengthDto(it.name, it.queueLength) })
        }
    }

    /**
     * Closes the room.
     * This also will push the final room close update to the eventsSink
     * and also close the eventsSink, thereby causing all subscriptions
     * to complete.
     */
    fun close(): CloseRoomDto {
        return withLock {
            val dto = CloseRoomDto(code)
            pushUpdate(dto)
            terminateUpdates()
             dto
        }
    }

    /**
     * Add an announcement.
     * @param announcement the contents of the announcement.
     * @return the DTO of the created announcement.
     */
    fun addAnnouncement(announcement: String): AnnouncementDto {
        return eventEmittingActionWithLock {
            val announcement = AnnouncementDto(UUID.randomUUID().toString(), code, announcement)
            val dto = AddAnnouncementDto(code, announcement)
            announcements.add(announcement)
            Pair(announcement, dto)
        }
    }

    /**
     * Remove an announcement.
     * @param id the ID of the announcement.
     */
    fun removeAnnouncement(id: String) {
        eventEmittingActionWithLock {
            val announcement = announcements.find {it.id == id} ?: throw AnnouncementNotFoundException()
            announcements.removeIf { it.id == id }
            Pair(null, RemoveAnnouncementDto(code, id))
        }
    }

    /**
     * Send a reminder to a participant
     * @param participantId the ID of the participant
     * @param fullName the full name of the participant
     */
    fun sendReminder(participantId: Long, fullName: String) {
        eventEmittingActionWithLock {
            val dto = RemindDto(code, ParticipantDto(participantId, fullName))
            Pair(null, dto)
        }
    }

    /**
     * Create a new queue in the room that it (optionally) bound to an assignment set.
     * @param name the name of the queue (mutable).
     * @param assignmentSetId the ID of the assignment set to bind to (immutable).
     * @return the DTO of the queue.
     */
    fun createQueue(name: String, assignmentSetId: Long?): QueueDto {
        return eventEmittingActionWithLock {
            val queue = Queue(courseId, code, name, assignmentSetId)
            queues[queue.id] = queue
            val dto = queue.toDto()
            Pair(dto, AddQueueDto(code, dto))
        }
    }

    /**
     * Edit a queue (name only).
     * @param id the ID of the queue.
     * @param name the new name for the queue.
     * @return the DTO of the modified queue.
     */
    fun editQueue(id: String, name: String): QueueDto {
        return eventEmittingActionWithLock {
            val queue = queues[id] ?: throw QueueNotFoundException()
            queue.name = name
            val dto = queue.toDto()
            Pair(dto, EditQueueDto(code, dto))
        }
    }

    /**
     * Delete a queue.
     * @param id the ID of the queue.
     */
    fun deleteQueue(id: String) {
        eventEmittingActionWithLock {
            val queue = queues[id] ?: throw QueueNotFoundException()
            queues.remove(queue.id)
            Pair(null, RemoveQueueDto(code, queue.id))
        }
    }

    /**
     * Enqueue a participant in a queue.
     * @param queueId the ID of the queue
     * @param participantId the ID of the participant
     * @param fullName
     * @param allowedAssignmentSets
     * @return the DTO of the added participant
     */
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

    /**
     * Acceptthe  top participant from a queue.
     * @param queueId ID of the queue.
     * @param accepterId participant ID of the accepter.
     * @param accepterFullName full name of the accepter.
     * @param groupIdFetchAction lambda to fetch the mapped group ID, given the participant ID and the assignment set ID.
     * @return the DTO for the acceptance event if successful or null if queue is empty.
     * @throws ParticipantNotFoundException if queue is empty.
     * @throws QueueNotFoundException if queue is not found.
     */
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

    /**
     * Accept a participant from a queue.
     * @param queueId ID of the queue.
     * @param participantId ID of the participant to accept.
     * @param accepterId participant ID of the accepter.
     * @param accepterFullName full name of the accepter.
     * @param groupIdFetchAction lambda to fetch the mapped group ID, given the participant ID and the assignment set ID.
     * @return the DTO for the acceptance event.
     * @throws ParticipantNotFoundException if participant is not in queue.
     * @throws QueueNotFoundException if queue is not found.
     */
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

    /**
     * Remove a participant from a queue.
     * @param queueId ID of the queue.
     */
    fun dequeueParticipant(queueId: String, participantId: Long): ParticipantDto {
        return eventEmittingActionWithLock {
            val queue = queues[queueId] ?: throw QueueNotFoundException()
            val participant = queue.dequeueParticipant(participantId) ?: throw ParticipantNotFoundException()
            Pair(participant.toDto(), DequeueDto(code, queue.id, participant.id))
        }
    }

    /**
     * Performs a subscription to the room.
     * The given pre-subscription action will be called (with the state at that point in time) before the subscription.
     * It is guaranteed that the state will not change until after the subscription has been performed.
     * @param preSubscribeAction the function to call immediately before the subscription happens.
     * @param subscriptionConsumer the consumer for state updates.
     * @param errorConsumer the consumer for errors.
     * @param onCompletion the <code>Runnable</code> to execute after a state updates end.
     */
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
            while(history.size > HISTORY_SIZE - 1) {
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