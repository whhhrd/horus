package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.services.participant.ParticipantService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class ParticipantServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var participantService: ParticipantService

    @WithLoginId(TEACHER_LOGIN)
    @Test
    fun testLabelLinkUnlink() {
        val student = getStudentParticipant()
        val oldLabelCount = student.labels.size

        val label = getFreshLabel()
        participantService.addLabel(student, label)

        assertEquals(oldLabelCount + 1, student.labels.size)
        assertTrue(label in student.labels)
        assertTrue(student in label.participants)

        participantService.removeLabelMapping(student, label)
        assertEquals(oldLabelCount, student.labels.size)
        assertFalse(label in student.labels)
        assertFalse(student in label.participants)
    }


}