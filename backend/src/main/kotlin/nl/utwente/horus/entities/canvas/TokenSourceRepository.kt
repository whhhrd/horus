package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface TokenSourceRepository: JpaRepository<TokenSource, Long> {

    @Query("SELECT t FROM TokenSource t WHERE t.id.course = ?1")
    fun getTokenSourceByCourse(course: Course): TokenSource?
}