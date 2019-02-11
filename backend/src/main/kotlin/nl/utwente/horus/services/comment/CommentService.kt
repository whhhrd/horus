package nl.utwente.horus.services.comment

import nl.utwente.horus.entities.comment.CommentRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class CommentService {

    @Autowired
    lateinit var commentRepository: CommentRepository

}