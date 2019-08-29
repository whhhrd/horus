package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.GroupNotFoundException
import nl.utwente.horus.exceptions.GroupSetNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable

class GroupServiceTest : HorusAbstractTest() {

    val ppGroup1MemberName = "Hellwing"

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var commentService: CommentService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupSetById() {
        val expectedGroupSet = createSampleGroup(getCurrentPerson()).groupSet
        val actualGroupSet = groupService.getGroupSetById(expectedGroupSet.id)
        assertEquals(expectedGroupSet, actualGroupSet)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupSetByExternalId() {
        val expectedGroupSet = createSampleGroup(getCurrentPerson()).groupSet
        val actualGroupSet = groupService.getGroupSetByExternalId(expectedGroupSet.externalId!!)
        assertEquals(expectedGroupSet, actualGroupSet)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupByExternalId() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val actualGroups = groupService.getGroupByExternalId(expectedGroup.externalId!!)
        assertEquals(1, actualGroups.size)
        assertEquals(expectedGroup, actualGroups[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupsByParticipantNoResults() {
        val groups = groupService.getGroupsByParticipant(
                participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID))
        assertEquals(0, groups.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupsByParticipant() {
        val expectedGroups = listOf(createSampleGroup(getCurrentPerson()))
        val actualGroups = groupService.getGroupsByParticipant(expectedGroups[0].participants[0])
        assertEquals(expectedGroups, actualGroups)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupByParticipantIdAndAssignmentSetId() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val assignmentSet = addGroupSetToNewAssignmentSet(getCurrentPerson(), expectedGroup.groupSet)
        val actualGroups = groupService.getGroupByParticipantIdAndAssignmentSetId(
                expectedGroup.participants[0].id, assignmentSet.id)
        assertEquals(expectedGroup, actualGroups)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testIsPersonMemberOfGroup() {
        val group = createSampleGroup(getCurrentPerson())
        assertFalse(groupService.isPersonMemberOfGroup(getCurrentPerson(), group))
        assertTrue(groupService.isPersonMemberOfGroup(group.participants[0].person, group))
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testIsPersonMemberOfGroupSet() {
        val group = createSampleGroup(getCurrentPerson())
        val groupSet = group.groupSet
        assertFalse(groupService.isPersonMemberOfGroupSet(getCurrentPerson(), groupSet))
        assertTrue(groupService.isPersonMemberOfGroupSet(group.participants[0].person, groupSet))
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupSignOffSearchResults() {
        val searchResult = groupService.getGroupSignOffSearchResults(PP_MOCK_COURSE_ID, ppGroup1MemberName)
        var found = false
        for (group in searchResult.groups) {
            for (memberName in group.memberNames) {
                if (memberName.toLowerCase().contains(ppGroup1MemberName.toLowerCase())) {
                    found = true
                }
            }
        }
        assertTrue(found)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupById() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val actualGroup = groupService.getGroupById(expectedGroup.id)
        assertEquals(expectedGroup, actualGroup)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetByGroupSetId() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val actualGroups = groupService.getByGroupSetId(expectedGroup.groupSet.id)
        assertEquals(1, actualGroups.size)
        assertEquals(expectedGroup, actualGroups[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupsByAssignmentSetId() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val assignmentSet = addGroupSetToNewAssignmentSet(getCurrentPerson(), expectedGroup.groupSet)
        val actualGroups = groupService.getGroupsByAssignmentSetId(Pageable.unpaged(), assignmentSet.id).toList()
        assertEquals(1, actualGroups.size)
        assertEquals(expectedGroup, actualGroups[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupsFiltered() {
        val expectedGroup = createSampleGroup(getCurrentPerson())
        val actualGroups = groupService.getGroupsFiltered(Pageable.unpaged(), PP_MOCK_COURSE_ID,
                expectedGroup.groupSet.id, null, listOf(), null, null).toList()
        assertEquals(1, actualGroups.size)
        assertEquals(expectedGroup, actualGroups[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddParticipantToGroup() {
        val group = createSampleGroup(getCurrentPerson())
        val newPerson = personService.createPerson("person3",
                "Eve", "Eve", "Eve", "eve@person.edu")
        val newParticipant = participantService.createParticipant(
                newPerson, getPPCourse(), roleService.getStudentRole())
        groupService.addParticipantToGroup(group, newParticipant)
        val updatedGroup = groupService.getGroupById(group.id)

        var found = false
        for (member in updatedGroup.members) {
            if (member.participant == newParticipant) {
                found = true
            }
        }
        assertTrue(found)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddGroup() {
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val groupSet = groupService.addGroupSet("ExternalID987", getPPCourse(), "GroupSet", creator)
        val addedGroup = groupService.addGroup(groupSet, "ExID512-256", "Group", creator)
        val retrievedGroup = groupService.getGroupById(addedGroup.id)
        assertEquals(addedGroup, retrievedGroup)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testUpdateGroup() {
        val group = createSampleGroup(getCurrentPerson())
        val newName = "UpdatedGroup"
        val updatedGroup = groupService.updateGroup(group.id,
                null, null, newName, null)
        assertEquals(newName, updatedGroup.name)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddThread() {
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val group = createSampleGroup(getCurrentPerson())
        val thread = commentService.createThread(CommentType.STAFF_ONLY, "Message", creator)
        groupService.addThread(group, thread)
        val groupWithThread = groupService.getGroupById(group.id)
        assertEquals(thread, groupWithThread.commentThread)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testArchiveGroup() {
        val group = createSampleGroup(getCurrentPerson())
        groupService.archiveGroup(group)
        val archivedGroup = groupService.getGroupById(group.id)
        assertNotNull(archivedGroup.archivedAt)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddGroupSet() {
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val expectedGroupSet = groupService.addGroupSet("ExternalID987",
                getPPCourse(), "GroupSet", creator)
        val retrievedGroupSet = groupService.getGroupSetById(expectedGroupSet.id)
        assertEquals(expectedGroupSet, retrievedGroupSet)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testUpdateGroupSet() {
        val groupSet = createSampleGroup(getCurrentPerson()).groupSet
        val newName = "UpdatedName"
        val updatedGroupSet = groupService.updateGroupSet(groupSet.id, null, newName)
        assertEquals(newName, updatedGroupSet.name)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteGroupSetById() {
        val groupSet = createSampleGroup(getCurrentPerson()).groupSet
        val groupSetId = groupSet.id
        groupService.deleteGroupSetByExternalId(groupSet.externalId!!)
        assertThrows(GroupSetNotFoundException::class) {
            groupService.getGroupSetById(groupSetId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteGroupSet() {
        val groupSet = createSampleGroup(getCurrentPerson()).groupSet
        val groupSetId = groupSet.id
        groupService.deleteGroupSet(groupSet)
        assertThrows(GroupSetNotFoundException::class) {
            groupService.getGroupSetById(groupSetId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteGroup() {
        val group = createSampleGroup(getCurrentPerson())
        val groupId = group.id
        groupService.deleteGroup(group)
        assertThrows(GroupNotFoundException::class) {
            groupService.getGroupById(groupId)
        }
    }


    private fun createSampleGroup(creatorPerson: Person): Group {
        val creator = participantService.getParticipationInCourse(creatorPerson, PP_MOCK_COURSE_ID)
        val groupSet = groupService.addGroupSet("ExternalID987", getPPCourse(), "GroupSet", creator)
        val group = groupService.addGroup(groupSet, "ExID512-256", "Group", creator)
        val person1 = personService.createPerson("person1",
                "Alice", "Alice", "Alice", "alice@person.edu")
        val person2 = personService.createPerson("person2",
                "Bob", "Bob", "Bob", "bob@person.edu")
        val participant1 = participantService.createParticipant(person1, getPPCourse(), roleService.getStudentRole())
        val participant2 = participantService.createParticipant(person2, getPPCourse(), roleService.getStudentRole())
        groupService.addParticipantToGroup(group, participant1)
        groupService.addParticipantToGroup(group, participant2)
        return group
    }

    private fun addGroupSetToNewAssignmentSet(creatorPerson: Person, groupSet: GroupSet): AssignmentSet {
        val creator = participantService.getParticipationInCourse(creatorPerson, PP_MOCK_COURSE_ID)
        val assignmentSet = assignmentService.createAssignmentSet(creator,
                getPPCourse(), AssignmentSetCreateDto("AssSet"))
        assignmentService.updateAssignmentSet(creatorPerson, assignmentSet.id, AssignmentSetUpdateDto(
                "AssSet", listOf(groupSet.id), null))
        return assignmentSet
    }

}
