package nl.utwente.horus.queuing

import nl.utwente.horus.queuing.exceptions.RoomNotFoundException
import nl.utwente.horus.representations.queuing.*
import nl.utwente.horus.representations.queuing.updates.AcceptDto
import nl.utwente.horus.representations.queuing.updates.InitialStateDto
import nl.utwente.horus.representations.queuing.updates.UpdateDto
import nl.utwente.horus.services.group.GroupService
import org.apache.commons.lang.RandomStringUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import reactor.core.Disposable
import java.util.concurrent.locks.ReentrantReadWriteLock
import java.util.function.Consumer
import kotlin.concurrent.read
import kotlin.concurrent.write

@Component
/**
 * QueuingStateManager manages the state of the queueing sub-system.
 * Methods are safe for concurrent use. All actions regarding the queuing
 * system should be performed via this singleton component.
 * Most methods simply call the room method of the same name, after
 * acquiring the read/write lock on the rooms map.
 * @see nl.utwente.horus.queuing.Room
 */
class QueuingStateManager {

    companion object {
        const val ROOM_CODE_LENGTH = 6

        val LOGGER = LoggerFactory.getLogger(QueuingStateManager::class.java)
    }

    private val lock = ReentrantReadWriteLock()

    private val rooms = HashMap<String, Room>()

    @Autowired
    private lateinit var groupService: GroupService

    /**
     * Gets the currently open rooms for the course.
     * @param courseId ID of the course.
     */
    fun getRooms(courseId: Long): List<RoomDto> {
        return read {
            rooms.values.filter { it.courseId == courseId }.map { it.toDto() }
        }
    }

    /**
     * Gets the lengths of the queue lengths of queues in all rooms of a course.
     * @param courseId ID of the course.
     * @return a list of <code>RoomQueueLengthsDto</code>, one per each room.
     */
    fun getRoomQueueLengths(courseId: Long): List<RoomQueueLengthsDto> {
        return read {
            val courseRooms = rooms.values.filter { it.courseId == courseId }
            courseRooms.map { it.toRoomQueueLengthsDto() }
        }
    }

    fun createRoom(courseId: Long, name: String): RoomDto {
        return write {
            var code: String = RandomStringUtils.randomAlphanumeric(ROOM_CODE_LENGTH).toUpperCase()
            while (rooms.keys.contains(code)) {
                code = RandomStringUtils.randomAlphanumeric(ROOM_CODE_LENGTH).toUpperCase()
            }
            val roomStateManager = Room(courseId, code, name)
            rooms[code] = roomStateManager
            RoomDto(courseId, code, name)
        }
    }

    fun closeRoom(courseId: Long, roomCode: String) {
        write {
            if (!rooms.containsKey(roomCode) || rooms[roomCode]!!.courseId != courseId) {
                throw RoomNotFoundException()
            }
            rooms[roomCode]!!.close()
            rooms.remove(roomCode)
        }
    }

    // Cron format reminder: second - minute - hour - dayOfMonth - month - dayOfWeek
    // Do at 4AM at night after a weekday (hence the TUE-SAT: also need to clean rooms of Friday afternoon)
    @Scheduled(cron = "0 0 4 * * TUE-SAT")
    fun closeAllRooms() {
        write {
            val size = rooms.size
            rooms.clear()
            LOGGER.info("Closed $size rooms automatically.")
        }
    }

    fun addAnnouncement(courseId: Long, roomCode: String, content: String): AnnouncementDto {
        return readOnCourseRoom(courseId, roomCode) {
            it.addAnnouncement(content)
        }
    }

    fun removeAnnouncement(courseId: Long, roomCode: String, id: String) {
        readOnCourseRoom(courseId, roomCode) {
            it.removeAnnouncement(id)
        }
    }

    fun createQueue(courseId: Long, roomCode: String, name: String, assignmentSetId: Long?): QueueDto {
        return readOnCourseRoom(courseId, roomCode) {
             it.createQueue(name, assignmentSetId)
        }
    }

    fun editQueue(courseId: Long, roomCode: String, id: String, name: String): QueueDto {
        return readOnCourseRoom(courseId, roomCode) {
            it.editQueue(id, name)
        }
    }

    fun deleteQueue(courseId: Long, roomCode: String, id: String) {
        readOnCourseRoom(courseId, roomCode) {
            it.deleteQueue(id)
        }
    }

    fun enqueueParticipant(courseId: Long, roomCode: String, queueId: String, participantId: Long, fullName: String, allowedAssignmentSets: List<Long>): QueueParticipantDto {
        return readOnCourseRoom(courseId, roomCode) {
            it.enqueueParticipant(queueId, participantId, fullName, allowedAssignmentSets)
        }
    }

    fun dequeueParticipant(courseId: Long, roomCode: String, queueId: String, participantId: Long) {
        readOnCourseRoom(courseId, roomCode) {
            it.dequeueParticipant(queueId, participantId)
        }
    }

    fun acceptParticipant(courseId: Long, roomCode: String, queueId: String, accepterId: Long, accepterFullName: String): AcceptDto {
        return readOnCourseRoom(courseId, roomCode) {
            it.acceptParticipant(queueId, accepterId, accepterFullName, this::getGroupIdByParticipantIdAndAssignmentSetId)
        }
    }

    fun acceptParticipant(courseId: Long, roomCode: String, queueId: String, participantId: Long, accepterId: Long, accepterFullName: String): AcceptDto {
        return readOnCourseRoom(courseId, roomCode) {
            it.acceptParticipant(queueId, participantId, accepterId, accepterFullName, this::getGroupIdByParticipantIdAndAssignmentSetId)
        }
    }

    fun sendReminder(courseId: Long, roomCode: String, id: Long, fullName: String) {
        readOnCourseRoom(courseId, roomCode) {
            it.sendReminder(id, fullName)
        }
    }

    /**
     * Performs a subscription for state updates in a room.
     * The given pre-subscription action will be called (with the state at that point in time) before the subscription.
     * It is guaranteed that the state will not change until after the subscription has been performed.
     * @param roomCode the code of the room.
     * @param preSubscribeAction the function to call immediately before the subscription happens.
     * @param subscriptionConsumer the consumer for state updates.
     * @param errorConsumer the consumer for errors.
     * @param onCompletion the <code>Runnable</code> to execute after a state updates end.
     * @see nl.utwente.horus.queuing.Room#atomicSubscribe()
     */
    fun atomicSubscribe(roomCode: String, preSubscribeAction: (InitialStateDto) -> Unit, subscriptionConsumer: Consumer<UpdateDto>, errorConsumer: Consumer<Throwable>, onCompletion: Runnable): Disposable {
        return read {
            getRoom(roomCode).atomicSubscribe(preSubscribeAction, subscriptionConsumer, errorConsumer, onCompletion)
        }
    }

    private fun getGroupIdByParticipantIdAndAssignmentSetId(participantId: Long, assignmentSetId: Long): Long? {
        return groupService.getGroupByParticipantIdAndAssignmentSetId(participantId, assignmentSetId)?.id
    }

    /**
     * Perform a safe read action on a room.
     * @param courseId ID of the course.
     * @param roomCode code of the room.
     * @param action the read action to perform.
     * @return the result of the action.
     */
    private fun <T> readOnCourseRoom(courseId: Long, roomCode: String, action: (Room) -> T): T {
        return read {
            action(getRoom(courseId, roomCode))
        }
    }

    private fun getRoom(courseId: Long, roomCode: String): Room {
        return read {
            val room = rooms[roomCode] ?: throw RoomNotFoundException()
            if (room.courseId != courseId) {
                throw RoomNotFoundException()
            }
            room
        }
    }

    private fun getRoom(roomCode: String): Room {
        return read {
            rooms[roomCode] ?: throw RoomNotFoundException()
        }
    }

    /**
     * Perform an action that mutates the rooms map.
     * @param action the action.
     * @return the result of the action.
     */
    private fun <T> write(action: () -> T): T {
        return lock.write {
            action()
        }
    }

    /**
     * Perform an action that does *not* mutate the rooms map.
     * @param action the action.
     * @return the result of the action.
     */
    private fun <T> read(action: () -> T): T {
        return lock.read {
            action()
        }
    }

}