package nl.utwente.horus.services.assignment

import nl.utwente.horus.entities.assignment.AssignmentRepository
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.AssignmentSetRepository
import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.services.course.CourseService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Transactional
@Component
class AssignmentService {
    @Autowired
    lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    lateinit var assignmentSetRepository: AssignmentSetRepository

    @Autowired
    lateinit var courseService: CourseService

    fun getAssignmentSetById(id: Long) : AssignmentSet {
        return assignmentSetRepository.findByIdOrNull(id) ?: throw AssignmentSetNotFoundException()
    }

}