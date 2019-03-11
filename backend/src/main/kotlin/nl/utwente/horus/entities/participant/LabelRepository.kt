package nl.utwente.horus.entities.participant

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface LabelRepository: JpaRepository<Label, Long> {

    fun existsLabelByCourseAndName(course: Course, name: String): Boolean
}