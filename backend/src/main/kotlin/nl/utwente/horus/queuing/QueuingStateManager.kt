package nl.utwente.horus.queuing

import nl.utwente.horus.queuing.exceptions.RoomNotFoundException
import nl.utwente.horus.representations.queuing.*
import nl.utwente.horus.representations.queuing.updates.AcceptDto
import nl.utwente.horus.representations.queuing.updates.InitialStateDto
import nl.utwente.horus.representations.queuing.updates.UpdateDto
import nl.utwente.horus.services.group.GroupService
import org.apache.commons.lang.RandomStringUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.Disposable
import java.util.concurrent.locks.ReentrantReadWriteLock
import java.util.function.Consumer
import kotlin.concurrent.read
import kotlin.concurrent.write

@Component
class QueuingStateManager {

    companion object {
        const val ROOM_CODE_LENGTH = 6
    }

    private val lock = ReentrantReadWriteLock()

    private val rooms = HashMap<String, Room>()

    @Autowired
    lateinit var groupService: GroupService

    fun getRooms(courseId: Long): List<RoomDto> {
        return read {
            rooms.values.filter { it.courseId == courseId }.map { it.toDto() }
        }
    }

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

    fun atomicSubscribe(roomCode: String, preSubscribeAction: (InitialStateDto) -> Unit, subscriptionConsumer: Consumer<UpdateDto>, errorConsumer: Consumer<Throwable>, onCompletion: Runnable): Disposable {
        return read {
            getRoom(roomCode).atomicSubscribe(preSubscribeAction, subscriptionConsumer, errorConsumer, onCompletion)
        }
    }

    fun getGroupIdByParticipantIdAndAssignmentSetId(participantId: Long, assignmentSetId: Long): Long? {
        return groupService.getGroupByParticipantIdAndAssignmentSetId(participantId, assignmentSetId)?.id
    }

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

    private fun <T> write(action: () -> T): T {
        return lock.write {
            action()
        }
    }

    private fun <T> read(action: () -> T): T {
        return lock.read {
            action()
        }
    }

}