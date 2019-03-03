package nl.utwente.horus.services.group

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.group.*
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.GroupNotFoundException
import nl.utwente.horus.exceptions.GroupSetNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Component
@Transactional
class GroupService {

    @Autowired
    lateinit var groupRepository: GroupRepository

    @Autowired
    lateinit var groupSetRepository: GroupSetRepository

    @Autowired
    lateinit var groupMemberRepository: GroupMemberRepository

    fun getGroupSetById(id: Long): GroupSet {
        return groupSetRepository.findByIdOrNull(id) ?: throw GroupSetNotFoundException()
    }

    fun getGroupSetByExternalId(externalId: String): GroupSet? {
        return groupSetRepository.getGroupSetByExternalId(externalId)
    }

    fun getGroupByExternalId(externalId: String): List<Group> {
        return groupRepository.findByExternalId(externalId)
    }

    fun getGroupById(id: Long): Group {
        return groupRepository.findByIdOrNull(id) ?: throw GroupNotFoundException()
    }

    fun addParticipantToGroup(group: Group, p: Participant) {
        val member = GroupMember(group, p)
        groupMemberRepository.save(member)
    }

    fun addGroup(groupSet: GroupSet, externalId: String?, name: String, author: Participant): Group {
        val g = Group(groupSet, externalId, name, author)
        return addGroup(g)
    }

    fun addGroup(g: Group): Group {
        return groupRepository.save(g)
    }

    fun updateGroup(id: Long, externalId: String?, commentThread: CommentThread?, name: String, archivedAt: ZonedDateTime?): Group {
        val g = groupRepository.findByIdOrNull(id) ?: throw GroupNotFoundException()
        g.externalId = externalId
        g.commentThread = commentThread
        g.name = name
        g.archivedAt = archivedAt
        return g
    }

    fun archiveGroup(g: Group) {
        if (!g.archived) {
            g.archivedAt = ZonedDateTime.now()
        }
    }

    fun addGroupSet(externalId: String, course: Course, name: String, author: Participant): GroupSet {
        val gs = groupSetRepository.save(GroupSet(externalId, course, name, author))
        course.groupSets.add(gs)
        return gs
    }

    fun updateGroupSet(id: Long, externalId: String?, name: String): GroupSet {
        val gs = groupSetRepository.findByIdOrNull(id) ?: throw GroupSetNotFoundException()
        gs.externalId = externalId
        gs.name = name
        return gs
    }

    fun deleteGroupSetById(id: String) {
        deleteGroupSet(getGroupSetByExternalId(id) ?: throw GroupSetNotFoundException())
    }

    fun deleteGroupSet(gs: GroupSet) {
        gs.groups.forEach { deleteGroup(it) }
        // Delete all associations
        gs.assignmentSetMappings.removeIf { m -> m.groupSet.id == gs.id }
        gs.course.groupSets.remove(gs)

        groupSetRepository.delete(gs)
    }


    fun deleteGroup(g: Group) {
        groupRepository.delete(g)
    }

}