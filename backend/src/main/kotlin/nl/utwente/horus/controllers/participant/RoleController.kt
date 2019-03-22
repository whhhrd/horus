package nl.utwente.horus.controllers.participant

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/roles"])
@Transactional
class RoleController: BaseController() {

    @Autowired
    lateinit var supplementaryRoleService: SupplementaryRoleService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @DeleteMapping(path = ["", "/"])
    fun removeRoleMapping(@RequestParam participantId: Long, @RequestParam roleId: Long) {
        verifyCoursePermission(Participant::class, participantId, HorusPermissionType.DELETE, HorusResource.COURSE_SUPPLEMENTARY_ROLE_MAPPING)
        val role = supplementaryRoleService.getSupplementaryRoleById(roleId)
        val participant = participantService.getParticipantById(participantId)

        supplementaryRoleService.deAssignSupplementaryRole(role, participant)
    }

    @PostMapping(path = ["", "/"])
    fun addRoleMapping(@RequestParam participantId: Long, @RequestParam roleId: Long) {
        verifyCoursePermission(Participant::class, participantId, HorusPermissionType.CREATE, HorusResource.COURSE_SUPPLEMENTARY_ROLE_MAPPING)
        val participant = participantService.getParticipantById(participantId)
        val role = supplementaryRoleService.getSupplementaryRoleById(roleId)
        val assigner = participantService.getCurrentParticipationInCourse(participant.course.id)
        supplementaryRoleService.assignSupplementaryRole(role, participant, assigner)
    }

}