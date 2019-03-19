package nl.utwente.horus.controllers

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.auth.permissions.HorusResourceScope
import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.io.OutputStream
import javax.servlet.http.HttpServletResponse
import kotlin.reflect.KClass

typealias EntityFetcher<T> = (id: Long) -> T
typealias CourseMapper<T> = (entity: T) -> Long
typealias MappedChecker<T> = (person: Person, entity: T) -> Boolean

@Component
@Transactional
abstract class BaseController {

    @Autowired
    private lateinit var userDetailService: HorusUserDetailService

    @Autowired
    private lateinit var assignmentService: AssignmentService

    @Autowired
    private lateinit var courseService: CourseService

    @Autowired
    private lateinit var participantService: ParticipantService

    @Autowired
    private lateinit var labelService: LabelService

    @Autowired
    private lateinit var groupService: GroupService

    data class EntityBundle<T>(
            val fetcher: EntityFetcher<T>,
            val mapper: CourseMapper<T>,
            val checker: MappedChecker<T>
    )

    companion object {
        const val XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        val TYPES_MAP = mapOf(
                AssignmentSet::class to HorusResource.COURSE_ASSIGNMENTSET,
                Comment::class to HorusResource.COURSE_COMMENT_STAFFONLY,
                Person::class to HorusResource.PERSON,
                Course::class to HorusResource.COURSE,
                Participant::class to HorusResource.COURSE_PARTICIPANT,
                Label::class to HorusResource.COURSE_LABEL,
                Group::class to HorusResource.COURSE_GROUP
        )

    }

    fun toHorusResource(commentThread: CommentThread): HorusResource {
        return if (commentThread.type == CommentType.STAFF_ONLY) {
            HorusResource.COURSE_COMMENT_STAFFONLY
        } else {
            HorusResource.COURSE_COMMENT_PUBLIC
        }
    }

    fun <T : Any> checkGlobalPermission(resourceClass: KClass<T>, type: HorusPermissionType) {

    }

    /**
     * Checks if the given permission is available to the current user for the given course.
     *
     * Does so by using the given [idClass] and the given [entityId] to do multiple things.
     * Firstly, it uses these two properties to discover in what [Course] the permission is requested.
     * Secondly, they are used to check if the current user is somehow "mapped" or associated to
     * the entity. This is subsequently used for determining if the entity falls within the
     * "hasOwn" permission.
     *
     * @param T The type of the resource used for determining the course and the "own"-relation.
     * @param idClass The class for the resource used for determining the course and "own"-relation.
     * @param entityId The ID used for retrieving an entity of type [T]/[idClass].
     *
     * This entity will be used for determining the current course, and for determining the existence
     * of a "own" relationship between the current person and the requested permission.
     *
     * @param diffResource By default, the type of [T]/[idClass] is used for determining the resource
     * of the requested permission. Populate this parameter to override this behaviour.
     */
    fun <T : Any> verifyCoursePermission(idClass: KClass<T>, entityId: Long,
                                         type: HorusPermissionType,
                                         diffResource: HorusResource? = null) {
        val bundle = getEntityBundle(idClass)!!
        val resource = diffResource ?: TYPES_MAP.getValue(idClass)

        val entity = bundle.fetcher(entityId)
        val courseId = bundle.mapper(entity)

        // Check if user has this permission regardless of being mapped to it
        val hasAny = userDetailService.hasCoursePermission(courseId,
                HorusPermission(resource, HorusResourceScope.ANY, type))
        if (hasAny) {
            return
        }

        // Didn't succeed: maybe has permission only when mapped to entity
        val hasOwn = userDetailService.hasCoursePermission(courseId,
                HorusPermission(resource, HorusResourceScope.OWN, type))
        val isMapped = bundle.checker(userDetailService.getCurrentPerson(), entity)
        if (hasOwn && isMapped) {
            return
        }

        // Also didn't succeed: operation not allowed
        throw InsufficientPermissionsException()
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T : Any> getEntityBundle(kClass: KClass<T>): EntityBundle<T>? {
        if (kClass == AssignmentSet::class) {
            return EntityBundle<AssignmentSet>(
                    assignmentService::getAssignmentSetById,
                    { set -> set.course.id },
                    assignmentService::isPersonMappedToAssignmentSet
            ) as EntityBundle<T>
        }
        if (kClass == Assignment::class) {
            return EntityBundle<Assignment>(
                    assignmentService::getAssignmentById,
                    { assignment -> assignment.assignmentSet.course.id },
                    { person, entity -> assignmentService.isPersonMappedToAssignmentSet(person, entity.assignmentSet) }
            ) as EntityBundle<T>
        }
        if (kClass == Course::class) {
            return EntityBundle<Course>(
                    courseService::getCourseById,
                    {it.id},
                    {person, entity -> participantService.doesParticipantExist(person.id, entity.id) }
            ) as EntityBundle<T>
        }
        if (kClass == Participant::class) {
            return EntityBundle<Participant>(
                    participantService::getParticipantById,
                    { it.course.id },
                    { person, entity -> entity.person.id == person.id }
            ) as EntityBundle<T>
        }
        if (kClass == Label::class) {
            return EntityBundle<Label>(
                    labelService::getLabelById,
                    { it.course.id },
                    { _, _ -> false } // Nobody is "related to" or "owns" a label. Own-permissions don't exist for labels.
            ) as EntityBundle<T>
        }
        if (kClass == Group::class) {
            return EntityBundle<Group>(
                    groupService::getGroupById,
                    { it.groupSet.course.id},
                    groupService::isPersonMemberOfGroup
            ) as EntityBundle<T>
        }
        return null
    }

    fun sendFile(response: HttpServletResponse, byteWriter: (OutputStream) -> Unit, mime: String, fileName: String) {
        response.contentType = mime
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=$fileName")
        byteWriter(response.outputStream)
        response.outputStream.flush()
        response.outputStream.close()

    }
}
