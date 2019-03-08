package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.services.signoff.SignOffService
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class SignOffServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var signOffService: SignOffService

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testHasSignOffsFilled() {
        val assignmentIds = getPPCourse().assignmentSets.first().assignments.take(5)
        val counts = signOffService.getSignOffResultCounts(assignmentIds.map { it.id })
        assertEquals(assignmentIds.size, counts.size)
        assignmentIds.forEach {assignment ->
            assertTrue(assignment in counts.keys)
            assertTrue(counts.getValue(assignment) > 0) // All initial assignments have sign-offs
        }
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testHasSignOffsEmpty() {
        val assignmentIds = listOf(1L, 2L, 3L)
        val counts = signOffService.getSignOffResultCounts(assignmentIds)
        assertEquals(assignmentIds.size, counts.size)
        assertTrue(counts.values.all { it == 0L })
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testHasSignOffsMixed() {
        val assignmentIds = listOf(1L, 3000L, 2L)
        val counts = signOffService.getSignOffResultCounts(assignmentIds).mapKeys { it.key.id }
        assertEquals(assignmentIds.size, counts.size)
        assertTrue(counts[1L] == 0L)
        assertTrue(counts.getValue(3000L) > 0L)
        assertTrue(counts[2L] == 0L)
    }
}