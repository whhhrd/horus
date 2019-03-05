package nl.utwente.horus.controllers.group

import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.group.GroupService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@Transactional
@RequestMapping(path=["/api/groups"])
class GroupController {

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/{groupId}"])
    fun getGroup(@PathVariable groupId: Long): GroupDtoFull {
        return GroupDtoFull(groupService.getGroupById(groupId))
    }

    @GetMapping(path = ["/{groupId}/comments"])
    fun getGroupComments(@PathVariable groupId: Long): CommentThreadDtoFull {
        val thread = groupService.getGroupById(groupId).commentThread ?: throw CommentThreadNotFoundException()
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{groupId}/comments"])
    fun addGroupComments(@PathVariable groupId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val user = userDetailService.getCurrentPerson()
        val thread = commentService.createThread(dto, user)
        val group = groupService.getGroupById(groupId)
        groupService.addThread(group, thread)
        return CommentThreadDtoFull(thread)
    }
}
