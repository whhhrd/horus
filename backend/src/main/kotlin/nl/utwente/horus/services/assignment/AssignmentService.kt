package nl.utwente.horus.services.assignment

import nl.utwente.horus.entities.assignment.AssignmentRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Transactional
@Component
class AssignmentService {

    @Autowired
    lateinit var assignmentRepository: AssignmentRepository

}