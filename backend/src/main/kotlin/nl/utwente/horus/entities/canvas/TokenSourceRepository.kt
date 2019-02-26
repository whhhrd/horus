package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface TokenSourceRepository: JpaRepository<TokenSource, Long> {

    fun getTokenSourceByCourse(course: Course): TokenSource?
}