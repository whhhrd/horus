package nl.utwente.horus.services.canvas

import edu.ksu.canvas.model.Enrollment
import edu.ksu.canvas.model.GroupCategory
import edu.ksu.canvas.model.GroupMembership
import edu.ksu.canvas.model.User
import nl.utwente.horus.entities.auth.Role
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
import nl.utwente.horus.exceptions.NoCanvasEntityException
import nl.utwente.horus.exceptions.SyncUnauthorizedException
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.job.JobProgress
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

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

    @Autowired
    lateinit var userDetailsService: HorusUserDetailService

    companion object {
        val LOGGER = LoggerFactory.getLogger(CanvasService::class.java)
    }

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
        val reader = getReaderWriter(token)
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

    fun listCanvasCourses(person: Person, filterTeacher: Boolean, filterAlreadyAdded: Boolean): List<CanvasCourseDto> {
        val reader = getReaderWriter(person)
        val courses = reader.getCoursesOfUser()
        if (filterTeacher) {
            courses.removeIf { !obtainedByTeacher(it) }
        }
        if (filterAlreadyAdded) {
            courses.removeIf { c -> courseService.existsCourseByExternalId(c.id.toString()) }
        }
        return courses.map { c -> CanvasCourseDto(c.id, c.courseCode, c.name, c.totalStudents,
                if (c.startAt == null) null
                else ZonedDateTime.ofInstant(c.startAt.toInstant(), ZoneId.systemDefault())) }
    }

    fun addCanvasCourse(canvasId: String, progress: JobProgress? = null) {
        val person = userDetailsService.getCurrentPerson()
        val token = getTokenByPerson(person)
        val reader = CanvasReaderWriter(token.token)
        val canvasCourse = reader.readCourse(canvasId)
        // Check pre-conditions before adding
        if (!obtainedByTeacher(canvasCourse) || courseService.existsCourseByExternalId(canvasCourse.id.toString())) {
            throw SyncUnauthorizedException()
        }

        // Create course instance
        val course = courseService.createCourse(canvasCourse.name, canvasCourse.id.toString(), canvasCourse.courseCode)
        // Temporarily save current user as teacher in Course, otherwise author can't be set in full Course sync
        participantService.createParticipant(person, course, roleService.getTeacherRole())
        // Save accompanying token
        tokenSourceRepository.save(TokenSource(course, token))
        // Do syncing of other properties of course
        doFullCanvasSync(course.id, progress)
    }

    private fun obtainedByTeacher(c: edu.ksu.canvas.model.Course): Boolean {
        // Course object only contains one enrollment: that of the requesting user
        return toHorusRole(c.enrollments.first()).id == roleService.getTeacherRole().id
    }

    fun doFullCanvasSync(courseId: Long, progress: JobProgress? = null) {
        val course = courseService.getCourseById(courseId)
        val author = participantService.getCurrentParticipationInCourse(courseId)
        doCanvasParticipantSync(course)
        doCanvasGroupCategoriesFetch(course, author)
        course.groupSets.forEach {doCanvasGroupsSync(it.id, progress)}
    }

    fun doCanvasParticipantSync(course: Course) {
        val users = fetchCourseUsers(course)
        processCourseUsers(course, users)
    }

    fun processCourseUsers(course: Course, users: List<User>) {
        val disappeared = course.participants.map { it.person.loginId }.toSet() - users.map { it.loginId }.toSet()
        course.participants.filter { p -> disappeared.contains(p.person.loginId) }.forEach { p -> p.enabled = false }
        // Check for each user if they are known as "person", and if they are already a participant
        users.forEach { user ->
            // Check and update user existence
            val enrollment = user.enrollments[0]
            var person = personService.getPersonByLoginId(user.loginId)
            if (person == null) {
                person = personService.createPerson(user.loginId, user.name, user.shortName, user.sortableName, user.email)
            } else {
                // Sortable name might be "out of date" or inconsistent due to having SAML as source
                person.sortableName = user.sortableName
            }
            // Check and update user participation
            val participant = person.participations.firstOrNull { it.course.id == course.id }
            if (participant == null) {
                participantService.createParticipant(person, course, toHorusRole(enrollment))
            } else {
                participant.role = toHorusRole(enrollment)
                participant.enabled = true
            }
        }

    }

    fun fetchCourseUsers(course: Course): List<User> {
        // Get all enrollments (which include personal data) of the course
        val reader = getReaderWriter(course)
        return reader.getCourseUsers(course.externalId ?: throw SyncUnauthorizedException())
    }

    fun doCanvasGroupCategoriesFetch(course: Course, author: Participant) {
        // Pull all group categories
        val reader = getReaderWriter(course)
        val categories = reader.getCourseGroupCategories(course.externalId ?: throw SyncUnauthorizedException())

        val deletedIds = course.groupSets.filter { it.externalId != null }.map { it.externalId!!} - categories.map { it.groupCategoryId.toString() }
        deletedIds.forEach { groupService.deleteGroupSetById(it) }

        categories.forEach { cat ->
            convertSaveCategory(course, cat, author)
        }
    }

    fun convertSaveCategory(course: Course, cat: GroupCategory, author: Participant): GroupSet {
        // Check for existence within course, and act upon that
        val existing = course.groupSets.firstOrNull { gs -> gs.externalId == cat.groupCategoryId.toString() }
        if (existing == null) {
            // Create new group set for this category
            return groupService.addGroupSet(cat.groupCategoryId.toString(), course, cat.name, author)
        } else {
            existing.name = cat.name
            return existing
        }
    }

    fun doCanvasGroupsSync(groupSetId: Long, jobProgress: JobProgress? = null) {
        val groupSet = groupService.getGroupSetById(groupSetId)
        LOGGER.info("Initiating Canvas sync for groupset $groupSetId (${groupSet.name})")
        val course = groupSet.course
        val author = courseService.getCurrentParticipationInCourse(course)

        val progress = jobProgress?.newSubCounter()

        // Pull all groups of category
        val reader = getReaderWriter(course)
        val groups = reader.getGroupsOfCategory(groupSet.externalId ?: throw SyncUnauthorizedException())
        progress?.totalTasks?.set(groups.size)
        val compositions = ConcurrentHashMap<edu.ksu.canvas.model.Group, Set<String>>()

        // Parallel fetching due to slow I/O
        val executor = Executors.newFixedThreadPool(4)
        groups.forEach {group -> executor.execute {
            compositions[group] = reader.getGroupUsers(group.groupId.toString()).map { it.loginId }.toSet()
            progress?.completedTasks?.incrementAndGet()
        }
        }
        executor.shutdown()
        executor.awaitTermination(Long.MAX_VALUE, TimeUnit.SECONDS)

        // First archive groups which have been deleted
        val missingGroups = groupSet.groups.map { g -> g.externalId!! }.toSet() - groups.map { g -> g.groupId.toString() }.toSet()
        missingGroups.map { groupService.getGroupByExternalId(it) }.flatten().forEach { groupService.archiveGroup(it) }

        // Check for each group if they already exist, and if their compositions are still correct
        groups.forEach { canvasGroup ->
            // Get currently existing equivalent
            saveCanvasGroup(canvasGroup, groupSet, author, compositions[canvasGroup])
        }

    }

    fun saveCanvasGroup(canvasGroup: edu.ksu.canvas.model.Group, groupSet: GroupSet, author: Participant, newCanvasLoginIds: Set<String>?) {
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
            if (newCanvasLoginIds != existingIds) {
                // Group composition has changed! Archive old group and create a new one
                groupService.archiveGroup(current)
                convertSaveGroup(canvasGroup, groupSet, author)
            }
        }
    }

    private fun convertSaveGroup(canvas: edu.ksu.canvas.model.Group, groupSet: GroupSet, author: Participant): Group {
        val reader = getReaderWriter(groupSet.course)
        val result = groupService.addGroup(Group(groupSet, canvas.groupId.toString(), canvas.name, author))

        // Add members to group
        val members = reader.getGroupUsers(result.externalId!!)
                .map { m -> personService.getPersonByLoginId(m.loginId) }
                .map { person -> participantService.getParticipationInCourse(person!!, groupSet.course.id) }
                .forEach { part -> groupService.addParticipantToGroup(result, part) }
        return result
    }

    fun createCanvasGroupCategory(course: Course, name: String, numberGroups: Int, groupSize: Int): GroupCategory {
        val writer = getReaderWriter(course)
        return writer.createGroupCategory(name,
                course.externalId ?: throw NoCanvasEntityException(), numberGroups, groupSize)
    }

    fun fillCanvasGroup(course: Course, groupId: String, canvasUserIds: List<Int>): List<GroupMembership> {
        val writer = getReaderWriter(course)
        return canvasUserIds.map {
            writer.addGroupMembership(groupId, it)
        }
    }

    fun getReaderWriter(course: Course): CanvasReaderWriter {
        val tokenSource = tokenSourceRepository.getTokenSourceByCourse(course) ?: throw CanvasTokenNotFoundException()
        return getReaderWriter(tokenSource.canvasToken)
    }

    fun getReaderWriter(tokenHolder: Person): CanvasReaderWriter {
        val token = getTokenByPerson(tokenHolder)
        return getReaderWriter(token)
    }

    fun getReaderWriter(canvasToken: CanvasToken): CanvasReaderWriter {
        return CanvasReaderWriter(canvasToken.token)
    }

    private fun toHorusRole(enrollment: Enrollment): Role {
        val type = enrollment.type
        if (type.contains("Teacher", ignoreCase = true)) {
            return roleService.getTeacherRole()
        }
        if (type.contains("Ta", ignoreCase = true)) {
            return roleService.getTaRole()
        } else {
            // Only remaining option: students and "fallback"
            return roleService.getStudentRole()
        }
    }

}