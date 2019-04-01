package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
interface SupplementaryRoleRepository: JpaRepository<SupplementaryRole, Long> {

    fun findAllByCourse(c: Course): List<SupplementaryRole>

    fun existsByNameAndCourse(name: String, course: Course): Boolean
}