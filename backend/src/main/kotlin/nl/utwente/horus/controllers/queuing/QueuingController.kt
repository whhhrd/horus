package nl.utwente.horus.controllers.queuing

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.auth.Role
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.queuing.*
import nl.utwente.horus.representations.queuing.requests.AnnouncementCreateDto
import nl.utwente.horus.representations.queuing.requests.QueueCreateDto
import nl.utwente.horus.representations.queuing.requests.QueueUpdateDto
import nl.utwente.horus.representations.queuing.requests.RoomCreateDto
import nl.utwente.horus.representations.queuing.updates.AcceptDto
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.queuing.QueuingService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@Transactional(readOnly = true)
@RequestMapping(path=["/api/queuing"])
class QueuingController: BaseController() {

    @Autowired
    private lateinit var queuingService: QueuingService

    @Autowired
    private lateinit var participantService: ParticipantService

    @GetMapping("/{courseId}/rooms")
    fun getRooms(@PathVariable courseId: Long): List<RoomDto> {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.VIEW)
        return queuingService.getRooms(courseId)
    }

    @GetMapping("/{courseId}/queues")
    fun getRoomQueueLengths(@PathVariable courseId: Long): List<RoomQueueLengthsDto> {
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.VIEW)
        return queuingService.getRoomQueueLengths(courseId)
    }

    @PostMapping("/{courseId}/rooms")
    fun createRoom(@PathVariable courseId: Long, @RequestBody dto: RoomCreateDto): RoomDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.createRoom(courseId, dto.name)
    }

    @DeleteMapping("/{courseId}/rooms/{roomCode}")
    fun closeRoom(@PathVariable courseId: Long, @PathVariable roomCode: String) {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.closeRoom(courseId, roomCode)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/announcements")
    fun addAnnouncement(@PathVariable courseId: Long, @PathVariable roomCode: String, @RequestBody dto: AnnouncementCreateDto): AnnouncementDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.addAnnouncement(courseId, roomCode, dto.content)
    }

    @DeleteMapping("/{courseId}/rooms/{roomCode}/announcements/{id}")
    fun removeAnnouncement(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable id: String) {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.removeAnnouncement(courseId, roomCode, id)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/queues")
    fun createQueue(@PathVariable courseId: Long, @PathVariable roomCode: String, @RequestBody dto: QueueCreateDto): QueueDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.createQueue(courseId, roomCode, dto.name, dto.assignmentSetId)
    }

    @PutMapping("/{courseId}/rooms/{roomCode}/queues/{id}")
    fun updateQueue(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable id: String, @RequestBody dto: QueueUpdateDto): QueueDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.editQueue(courseId, roomCode, id, dto.name)
    }

    @DeleteMapping("/{courseId}/rooms/{roomCode}/queues/{id}")
    fun deleteQueue(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable id: String) {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.deleteQueue(courseId, roomCode, id)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/queues/{queueId}/participants/self")
    fun enqueue(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable queueId: String): QueueParticipantDto {
        requireCourseRoles(courseId, Role.STUDENT)
        return queuingService.enqueue(courseId, roomCode, queueId)
    }

    @DeleteMapping("/{courseId}/rooms/{roomCode}/queues/{queueId}/participants/self")
    fun dequeue(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable queueId: String) {
        requireCourseRoles(courseId, Role.STUDENT)
        return queuingService.dequeue(courseId, roomCode, queueId)
    }

    @DeleteMapping("/{courseId}/rooms/{roomCode}/queues/{queueId}/participants/{id}")
    fun dequeueParticipant(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable queueId: String, @PathVariable id: Long) {
        if (id == participantService.getCurrentParticipationInCourse(courseId).id){
            requireCourseRoles(courseId, Role.STUDENT)
        } else {
            requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        }
        return queuingService.dequeueParticipant(courseId, roomCode, queueId, id)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/queues/{queueId}/participants/next/accept")
    fun acceptNext(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable queueId: String): AcceptDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.acceptNext(courseId, roomCode, queueId)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/queues/{queueId}/participants/{id}/accept")
    fun acceptParticipant(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable queueId: String, @PathVariable id: Long): AcceptDto {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.acceptParticipant(courseId, roomCode, queueId, id)
    }

    @PostMapping("/{courseId}/rooms/{roomCode}/participants/{id}/remind")
    fun remindParticipant(@PathVariable courseId: Long, @PathVariable roomCode: String, @PathVariable id: Long) {
        requireCourseRoles(courseId, Role.TEACHER, Role.TEACHING_ASSISTANT)
        return queuingService.sendReminder(courseId, roomCode, id)
    }

}