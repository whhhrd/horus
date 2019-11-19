package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.course.PersonalCoursePreferencesController
import nl.utwente.horus.representations.BooleanDto
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired


class PersonalCoursePreferencesControllerTest : HorusAbstractTest() {

    @Autowired
    lateinit var controller: PersonalCoursePreferencesController

    @Test
    @WithLoginId(HorusAbstractTest.SS_NA_LOGIN)
    fun testNAHideCourse() {
        assertInsufficientPermissions { controller.setCourseHidden(HorusAbstractTest.SS_MOCK_COURSE_ID, BooleanDto(true)) }
    }

    @Test
    @WithLoginId(HorusAbstractTest.SS_STUDENT_LOGIN)
    fun testStudentHideCourse() {
        assertSufficientPermissions { controller.setCourseHidden(HorusAbstractTest.SS_MOCK_COURSE_ID, BooleanDto(false)) }
    }

    @Test
    @WithLoginId(HorusAbstractTest.SS_TA_LOGIN)
    fun testTAHideCourse() {
        assertSufficientPermissions { controller.setCourseHidden(HorusAbstractTest.SS_MOCK_COURSE_ID, BooleanDto(true)) }
    }

    @Test
    @WithLoginId(HorusAbstractTest.SS_TEACHER_LOGIN)
    fun testTeacherHideCourse() {
        assertSufficientPermissions { controller.setCourseHidden(HorusAbstractTest.SS_MOCK_COURSE_ID, BooleanDto(true)) }
    }

}