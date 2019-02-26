package nl.utwente.horus.services.canvas

import edu.ksu.canvas.CanvasApiFactory
import edu.ksu.canvas.interfaces.*
import edu.ksu.canvas.model.*
import edu.ksu.canvas.oauth.NonRefreshableOauthToken
import edu.ksu.canvas.oauth.OauthToken
import edu.ksu.canvas.requestOptions.GetEnrollmentOptions
import edu.ksu.canvas.requestOptions.GetSingleCourseOptions
import edu.ksu.canvas.requestOptions.GetUsersInCourseOptions
import edu.ksu.canvas.requestOptions.ListCurrentUserCoursesOptions
import nl.utwente.horus.exceptions.CourseNotFoundException
import nl.utwente.horus.unwrap

class CanvasReaderWriter {
    val CANVAS_URL = "https://canvas.utwente.nl"
    private val factory: CanvasApiFactory
    private val token: OauthToken

    constructor(token: String) {
        this.token = NonRefreshableOauthToken(token)
        this.factory = CanvasApiFactory(CANVAS_URL)
    }

    fun readCourse(externalId: String): Course {
        val reader = factory.getReader(CourseReader::class.java, token)
        val result = reader.getSingleCourse(GetSingleCourseOptions(externalId))
        return result.unwrap() ?: throw CourseNotFoundException()
    }

    fun getCourseGroupCategories(externalCourseId: String): List<GroupCategory> {
        val reader = factory.getReader(GroupCategoryReader::class.java, token)
        return reader.listCourseGroupCategories(Integer.parseInt(externalCourseId))!!
    }

    fun getCourseGroups(externalCourseId: String): List<Group> {
        val reader = factory.getReader(GroupReader::class.java, token)
        return reader.listCourseGroups(Integer.parseInt(externalCourseId))
    }

    fun getGroupMemberships(externalGroupId: String): List<GroupMembership> {
        val reader = factory.getReader(GroupMembershipReader::class.java, token)
        return reader.listGroupMemberships(Integer.parseInt(externalGroupId))
    }

    fun getGroupUsers(externalGroupId: String): List<User> {
        val reader = factory.getReader(UserReader::class.java, token)
        return reader.getUsersInGroup(Integer.parseInt(externalGroupId))
    }

    fun getGroupsOfCategory(externalGroupCategoryId: String) : List<Group> {
        val reader = factory.getReader(GroupReader::class.java, token)
        return reader.listGroupsInCategory(Integer.parseInt(externalGroupCategoryId))
    }

    fun getCourseEnrollments(externalCourseId: String): List<Enrollment> {
        val reader = factory.getReader(EnrollmentReader::class.java, token)
        return reader.getCourseEnrollments(GetEnrollmentOptions(externalCourseId))
    }

    fun getCourseUsers(externalCourseId: String): List<User> {
        val reader = factory.getReader(UserReader::class.java, token)
        val options = GetUsersInCourseOptions(externalCourseId)
        // Also include # students in resulting objects
        options.include(listOf(GetUsersInCourseOptions.Include.ENROLLMENTS))
        // Only include users who have accepted course invitation
        // Users who haven't accepted are missing vital information like the login ID
        options.enrollmentState(listOf(GetUsersInCourseOptions.EnrollmentState.ACTIVE))
        return reader.getUsersInCourse(options)
    }

    fun getCoursesOfUser(): MutableList<Course> {
        val reader = factory.getReader(CourseReader::class.java, token)
        val options = ListCurrentUserCoursesOptions()
        options.includes(listOf(ListCurrentUserCoursesOptions.Include.TOTAL_STUDENTS))
        return reader.listCurrentUserCourses(options)
    }

    fun getCurrentUserInfo(): User? {
        val reader = factory.getReader(UserReader::class.java, token)
        return reader.showUserDetails("self").unwrap()
    }

}