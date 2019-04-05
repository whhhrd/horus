package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.exceptions.LabelNotFoundException
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class LabelServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var labelService: LabelService

    @Autowired
    lateinit var participantService: ParticipantService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateLabel() {
        val name = "pandora-guy"
        val course = getPPCourse()
        val resultId = labelService.createLabel(course, name, COLOR_STR).id

        val result = labelService.getLabelById(resultId)
        assertTrue(result.name == name)
        assertEquals(course.id, result.course.id)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testUpdate() {
        val label = getFreshLabel()
        val oldName = label.name
        val newName = oldName + "abcd"

        labelService.updateLabel(null, label.id, newName, label.color)
        assertEquals(null, newName, label.name)

        val newColor = "09af3D"
        labelService.updateLabel(label.course.id, label.id, oldName, newColor)
        assertEquals(newColor.toUpperCase(), label.color)
        assertEquals(oldName, label.name)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testLabelCount() {
        val count = 5L // Has to be long due to comparison to result of getUsageCount()
        val label = getFreshLabel()
        PP_PARTICIPANT_IDS.take(count.toInt()).forEach {p ->
            participantService.addLabel(participantService.getParticipantById(p), label)
        }
        assertEquals(count, labelService.getUsageCount(label))
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testLabelDelete() {
        val label = getFreshLabel()
        val participant = getStudentParticipant()
        val oldCount = participant.labels.size

        participantService.addLabel(participant, label)
        labelService.deleteLabel(label)
        // Label should be removed from participant
        assertEquals(oldCount, participant.labels.size)
        try {
            labelService.getLabelById(label.id)
            fail()
        } catch (e: LabelNotFoundException) {
            // As expected: should be deleted
        }
    }
}
