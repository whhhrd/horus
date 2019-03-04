package nl.utwente.horus.controllers.group

import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.services.group.GroupService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Transactional
@RequestMapping(path=["/api/groups"])
class GroupController {

    @Autowired
    lateinit var groupService: GroupService

    @GetMapping(path = ["/{groupId}"])
    fun getGroup(@PathVariable groupId: Long): GroupDtoFull {
        return GroupDtoFull(groupService.getGroupById(groupId))
    }
}
