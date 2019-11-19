package nl.utwente.horus.controllers.course

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.BooleanDto
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/courses/{courseId}/preferences/personal"])
@Transactional
class PersonalCoursePreferencesController: BaseController() {
    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var participantService: ParticipantService


    @PutMapping(path = ["/hidden"])
    fun setCourseHidden(@PathVariable courseId: Long, @RequestBody newValue: BooleanDto): BooleanDto {
        // Permission is part of listing: allow to define yourself if you actually want to see it
        verifyCoursePermission(Course::class, courseId, HorusPermissionType.LIST)

        val p = participantService.getCurrentParticipationInCourse(courseId)
        val result = participantService.setParticipantHidden(p, newValue.value)
        return BooleanDto(result)
    }
}