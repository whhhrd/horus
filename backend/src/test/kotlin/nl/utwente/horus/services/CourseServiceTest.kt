package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.services.course.CourseService
import org.junit.Assert
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class CourseServiceTest: HorusAbstractTest() {

    @Autowired
    lateinit var courseService: CourseService

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCoursesList() {
        val courses = courseService.getAllParticipatingCourses(getCurrentPerson())
        Assert.assertTrue("Current person has no courses", courses.isNotEmpty())
    }

    @Test
    @WithLoginId(STUDENT_LOGIN)
    fun testMultipleParticipations() {
        val participations = courseService.getAllParticipatingCourses(getCurrentPerson())
        Assert.assertTrue("Student doesn't have multiple courses", participations.size > 1)
    }
}