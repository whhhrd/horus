package nl.utwente.horus.entities.assignmentgroupmapping

import nl.utwente.horus.entities.course.Course
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface AssignmentGroupSetsMappingRepository: JpaRepository<AssignmentGroupSetsMapping,
        AssignmentGroupSetsMapping.AssignmentGroupMappingId> {

    @Query("SELECT m FROM AssignmentGroupSetsMapping m, GroupSet g WHERE m.id.groupSet = g AND g.course = ?1")
    fun findMappingsInCourse(course: Course) : List<AssignmentGroupSetsMapping>
}