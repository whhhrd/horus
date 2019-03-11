package nl.utwente.horus.services.participant

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.LabelRepository
import nl.utwente.horus.entities.participant.ParticipantLabelMappingRepository
import nl.utwente.horus.exceptions.*
import nl.utwente.horus.representations.participant.LabelCreateUpdateDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class LabelService {

    @Autowired
    lateinit var labelRepository: LabelRepository

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var participantLabelMappingRepository: ParticipantLabelMappingRepository

    fun getLabelById(id: Long): Label {
        return labelRepository.findByIdOrNull(id) ?: throw LabelNotFoundException()
    }

    fun isLabelNameTaken(course: Course, name: String): Boolean {
        return labelRepository.existsLabelByCourseAndName(course, name)
    }

    fun validColorString(color: String): Boolean {
        return Regex("[A-Fa-f0-9]{6}") matches color
    }

    fun validLabelName(name: String): Boolean {
        return Regex("[-a-z0-9]{1,15}") matches name
    }

    fun createLabel(course: Course, dto: LabelCreateUpdateDto): Label {
        return createLabel(course, dto.name, dto.color)
    }

    fun createLabel(course: Course, name: String, color: String): Label {
        val normalizedColor = color.toUpperCase()
        if (isLabelNameTaken(course, name)) {
            throw ExistingLabelNameException()
        }
        if (!validColorString(normalizedColor)) {
            throw InvalidColorException()
        }
        if (!validLabelName(name)) {
            throw InvalidLabelNameException()
        }
        val label = Label(course, name, normalizedColor)
        return labelRepository.save(label)
    }

    fun updateLabel(courseId: Long?, labelId: Long, dto: LabelCreateUpdateDto): Label {
        return updateLabel(courseId, labelId, dto.name, dto.color)
    }

    fun updateLabel(courseId: Long?, id: Long, name: String, color: String): Label {
        val label = getLabelById(id)
        val normalizedColor = color.toUpperCase()
        if (courseId != null && courseId != label.course.id) {
            throw CourseMismatchException()
        }
        if (!validColorString(normalizedColor)) {
            throw InvalidColorException()
        }
        if (!validLabelName(name)) {
            throw InvalidLabelNameException()
        }

        label.name = name
        label.color = normalizedColor
        return label
    }

    fun getUsageCount(label: Label): Long {
        return participantLabelMappingRepository.countLabelUsages(label)
    }

    fun deleteLabel(label: Label) {
        val mappings = label.participantMappings
        // Delete all mappings first
        val iterator = mappings.iterator()
        for (mapping in iterator) {
            mapping.participant.labelMappings.remove(mapping)
            iterator.remove()
            participantLabelMappingRepository.delete(mapping)
        }
        label.course.labels.remove(label)
        // Ready to delete label
        labelRepository.delete(label)
    }

}