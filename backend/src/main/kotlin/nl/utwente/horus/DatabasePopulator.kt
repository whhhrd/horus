package nl.utwente.horus

import nl.utwente.horus.entities.course.CourseRepository
import org.hibernate.Session
import org.hibernate.SessionFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.support.EncodedResource
import org.springframework.jdbc.datasource.init.ScriptUtils
import org.springframework.stereotype.Component
import org.springframework.util.ResourceUtils
import java.io.File
import java.sql.Connection
import javax.persistence.EntityManagerFactory

/**
 * Populates database using SQL scripts.
 * Only acts when the COURSE table is empty, and then fills the ENTIRE database (so also other tables!).
 */
@Component
class DatabasePopulator {

    @Autowired
    lateinit var courseRepository: CourseRepository

    @Autowired
    lateinit var entities: EntityManagerFactory

    @EventListener
    fun populate(event: ApplicationReadyEvent) {
        if (courseRepository.count() == 0L) {
            val manager = entities.createEntityManager()
            val transaction = manager.transaction
            transaction.begin()
            val scriptNames = listOf(
                    "1_courses.sql",
                    "1a_roles.sql",
                    "2_person.sql",
                    "3_comments.sql",
                    "4_participant.sql",
                    "5_assignment_sets.sql",
                    "6_assignments.sql",
                    "7_groups.sql",
                    "8_group_members.sql",
                    "9_group_assignment_mapping.sql"
            )
            scriptNames.forEach {script: String ->
                try {
                    val sql = ResourceUtils.getFile("classpath:db/mockdata/$script").readText()
                    sql.lines().forEach { line: String ->
                        val query = manager.createNativeQuery(line)
                        query.executeUpdate()
                    }
                } catch (e: Exception) {
                    throw RuntimeException("Error occurred executing $script", e)
                }
            }
            transaction.commit()
        }
    }
}