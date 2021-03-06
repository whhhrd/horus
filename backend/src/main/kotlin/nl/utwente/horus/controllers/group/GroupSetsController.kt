package nl.utwente.horus.controllers.group

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoFull
import nl.utwente.horus.services.group.GroupService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Transactional
@RequestMapping(path=["/api/groupSets"])
class GroupSetsController: BaseController() {

    @Autowired
    lateinit var groupService: GroupService

    @GetMapping("/{groupSetId}/")
    fun getGroupSet(@PathVariable groupSetId: Long): GroupSetDtoFull {
        verifyCoursePermission(GroupSet::class, groupSetId, HorusPermissionType.VIEW)

        return GroupSetDtoFull(groupService.getGroupSetById(groupSetId))
    }

    @GetMapping("/{groupSetId}/groups")
    fun getGroupSetGroups(@PathVariable groupSetId: Long): List<GroupDtoFull> {
        requireAnyPermission(GroupSet::class, groupSetId, HorusPermissionType.VIEW, HorusResource.COURSE_GROUP)

        return groupService.getByGroupSetId(groupSetId).map { GroupDtoFull(it) }
    }
}