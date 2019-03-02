package nl.utwente.horus.services.canvas

import edu.ksu.canvas.model.Enrollment
import nl.utwente.horus.entities.canvas.CanvasToken
import nl.utwente.horus.entities.canvas.CanvasTokenRepository
import nl.utwente.horus.entities.canvas.TokenSource
import nl.utwente.horus.entities.canvas.TokenSourceRepository
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CanvasTokenNotFoundException
import nl.utwente.horus.exceptions.InvalidCanvasTokenException
import nl.utwente.horus.exceptions.SyncUnauthorizedException
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneId
import java.time.ZonedDateTime

@Component
@Transactional
class CanvasService {

    @Autowired
    lateinit var canvasTokenRepository: CanvasTokenRepository

    @Autowired
    lateinit var tokenSourceRepository: TokenSourceRepository

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var groupService: GroupService

    fun getTokenByCourseId(courseId: Long) : CanvasToken {
        return getTokenByCourse(courseService.getCourseById(courseId))
    }

    fun getTokenByCourse(course: Course): CanvasToken {
        val source =  tokenSourceRepository.getTokenSourceByCourse(course) ?: throw CanvasTokenNotFoundException()
        return source.canvasToken
    }

    fun getTokenByPerson(person: Person): CanvasToken {
        return canvasTokenRepository.getCanvasTokenByPerson(person) ?: throw CanvasTokenNotFoundException()
    }

    fun checkPersonCanvasTokenValid(person: Person): Boolean {
        val token = canvasTokenRepository.getCanvasTokenByPerson(person) ?: return false
        return checkCanvasTokenValid(token)
    }

    fun checkCanvasTokenValid(token: CanvasToken): Boolean {
        val reader = getReader(token)
        return try {
            reader.getCurrentUserInfo() != null
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Adds Canvas token to repository.
     * Result is null when the token turned out to be invalid.
     */
    fun addToken(person: Person, token: String): CanvasToken {
        var canvasToken = canvasTokenRepository.getCanvasTokenByPerson(person)
        if (canvasToken != null) {
            // Token already existing: update it
            canvasToken.token = token
        } else {
            canvasToken = CanvasToken(person, token)
            canvasTokenRepository.save(canvasToken)
        }
        val valid = checkCanvasTokenValid(canvasToken)
        if (!valid) {
           throw InvalidCanvasTokenException()
        }
        return canvasToken
    }

    fun listCanvasCourses(person: Person, filterStaff: Boolean, filterAlreadyAdded: Boolean): List<CanvasCourseDto> {
        val reader = getReader(person)
        val courses = reader.getCoursesOfUser()
        if (filterStaff) {
            courses.removeIf { !obtainedByStaff(it) }
        }
        if (filterAlreadyAdded) {
            courses.removeIf { c -> courseService.existsCourseByExternalId(c.id.toString()) }
        }
        return courses.map { c -> CanvasCourseDto(c.id, c.courseCode, c.name, c.totalStudents,
                ZonedDateTime.ofInstant(c.startAt.toInstant(), ZoneId.systemDefault())) }

    }

    fun addCanvasCourse(author: Person, canvasId: String): Course {
        val token = getTokenByPerson(author)
        val reader = CanvasReaderWriter(token.token)
        val canvasCourse = reader.readCourse(canvasId)
        // Check pre-conditions before adding
        if (!obtainedByStaff(canvasCourse) || courseService.existsCourseByExternalId(canvasCourse.id.toString())) {
            // TODO: Replace exception below with right Forbidden-exception once that PR is merged
            throw SyncUnauthorizedException()
        }

        // Create course instance
        val course = courseService.createCourse(canvasCourse.name, canvasCourse.id.toString(), canvasCourse.courseCode)
        // Save accompanying token
        tokenSourceRepository.save(TokenSource(course, token))
        // Do syncing of other properties of course
        doCanvasPersonSync(course)
        // author variable is not updated: re-retrieve it from the course instance
        val participation = course.participants.first {p -> p.person.id == author.id}
        doCanvasGroupCategoriesFetch(course, participation)
        course.groupSets.forEach {doCanvasGroupsSync(it, participation)}
        return course
    }

    private fun obtainedByStaff(c: edu.ksu.canvas.model.Course): Boolean {
        // Course object only contains one enrollment: that of the requesting user
        // TODO: Integrate this with proper role API
        // Constant based on mock data
        return toHorusRole(c.enrollments.first()) != 1L
    }

    fun doFullCanvasSync(author: Person, course: Course): Course {
        doCanvasPersonSync(course)
        val participation = course.participants.first {p -> p.person.id == author.id}
        doCanvasGroupCategoriesFetch(course, participation)
        course.groupSets.forEach {doCanvasGroupsSync(it, participation)}
        return course
    }

    fun doCanvasPersonSync(course: Course) {
        // Get all enrollments (which include personal data) of the course
        val reader = getReader(course)
        val users = reader.getCourseUsers(course.externalId ?: throw SyncUnauthorizedException())

        val disappeared = course.participants.map { it.person.loginId }.toSet() - users.map { it.loginId }.toSet()
        course.participants.filter { p -> disappeared.contains(p.person.loginId) }.forEach { p -> p.enabled = false }
        // Check for each user if they are known as "person", and if they are already a participant
        users.forEach { user ->
            // Check and update user existence
            val enrollment = user.enrollments[0]
            var person = personService.getPersonByLoginId(user.loginId)
            if (person == null) {
                person = personService.createPerson(user.loginId, user.name, user.shortName, user.email)
            }
            // Check and update user participation
            val participant = person.participations.firstOrNull { it.course.id == course.id }
            if (participant == null) {
                participantService.createParticipant(person, course, toHorusRole(enrollment))

            } else {
                participant.role = roleService.getRoleById(toHorusRole(enrollment))
                participant.enabled = true
            }
        }
    }

    fun doCanvasGroupCategoriesFetch(course: Course, author: Participant) {
        // Pull all group categories
        val reader = getReader(course)
        val categories = reader.getCourseGroupCategories(course.externalId ?: throw SyncUnauthorizedException())

        categories.forEach { cat ->
            // Check for existence within course, and act upon that
            val existing = course.groupSets.firstOrNull { gs -> gs.externalId == cat.groupCategoryId.toString() }
            if (existing == null) {
                // Create new group set for this category
                groupService.addGroupSet(cat.groupCategoryId.toString(), course, cat.name, author)
            } else {
                existing.name = cat.name
            }
        }
    }

    fun doCanvasGroupsSync(groupSet: GroupSet, author: Participant) {
        // Pull all groups of category
        val reader = getReader(groupSet.course)
        val groups = reader.getGroupsOfCategory(groupSet.externalId ?: throw SyncUnauthorizedException())

        // First archive groups which have been deleted
        val missingGroups = groupSet.groups.map { g -> g.externalId!! }.toSet() - groups.map { g -> g.groupId.toString() }.toSet()
        missingGroups.map { groupService.getGroupByExternalId(it) }.flatten().forEach { groupService.archiveGroup(it) }

        // Check for each group if they already exist, and if their compositions are still correct
        groups.forEach { canvasGroup ->
            // Get currently existing equivalent
            val existing = groupService.getGroupByExternalId(canvasGroup.groupId.toString())
            if (existing.isEmpty()) {
                // Group does not yet exist
                convertSaveGroup(canvasGroup, groupSet, author)
            } else {
                // Group is a list, since same Canvas-group could have different compositions over time
                // However, here we are only interested in the un-archived one, a.k.a. the currently active one
                val current = existing.first { !it.archived }

                // Check if group composition has changed since last sync
                val existingIds = current.participants.map { it.person.loginId }.toSet()
                val canvasIds = reader.getGroupUsers(canvasGroup.groupId.toString()).map { it.loginId }.toSet()
                if (canvasIds != existingIds) {
                    // Group composition has changed! Archive old group and create a new one
                    groupService.archiveGroup(current)
                    convertSaveGroup(canvasGroup, groupSet, author)
                }
            }
        }

    }

    private fun convertSaveGroup(canvas: edu.ksu.canvas.model.Group, groupSet: GroupSet, author: Participant): Group {
        val reader = getReader(groupSet.course)
        val result = groupService.addGroup(Group(groupSet, canvas.groupId.toString(), canvas.name, author))

        // Add members to group
        val members = reader.getGroupUsers(result.externalId!!)
        members.map { m -> personService.getPersonByLoginId(m.loginId) }
                .map { person -> participantService.getParticipationInCourse(person!!, groupSet.course.id) }
                .forEach { part -> groupService.addParticipantToGroup(result, part) }
        return result
    }

    private fun getReader(course: Course): CanvasReaderWriter {
        val tokenSource = tokenSourceRepository.getTokenSourceByCourse(course) ?: throw CanvasTokenNotFoundException()
        return getReader(tokenSource.canvasToken)
    }

    private fun getReader(tokenHolder: Person): CanvasReaderWriter {
        val token = getTokenByPerson(tokenHolder)
        return getReader(token)
    }

    private fun getReader(canvasToken: CanvasToken): CanvasReaderWriter {
        return CanvasReaderWriter(canvasToken.token)
    }

    private fun toHorusRole(enrollment: Enrollment): Long {
        val type = enrollment.type
        // TODO: Integrate with proper permissions API
        // Ids below based on mocking data
        if (type.contains("Teacher", ignoreCase = true)) {
            return 2
        }
        if (type.contains("Ta", ignoreCase = true)) {
            return 3
        } else {
            // Only remaining option: students and "fallback"
            return 1
        }
    }

}