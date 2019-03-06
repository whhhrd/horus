package nl.utwente.horus.entities.assignment

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface AssignmentRepository: JpaRepository<Assignment, Long> {
    fun findAllByIdIn(ids: List<Long>): List<Assignment>
}