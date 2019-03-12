package nl.utwente.horus.services.participant

import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.entities.auth.*
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class SupplementaryRoleService {

    @Autowired
    lateinit var mappingRepository: ParticipantSupplementaryRoleMappingRepository

    @Autowired
    lateinit var supplementaryRoleRepository: SupplementaryRoleRepository

    @Autowired
    lateinit var supplementaryRolePermissionRepository: SupplementaryRolePermissionRepository

    @Autowired
    lateinit var permissionRepository: PermissionRepository

    @Autowired
    lateinit var participantService: ParticipantService

    fun getSupplementaryRoleById(id: Long): SupplementaryRole {
        return supplementaryRoleRepository.findByIdOrNull(id) ?: throw SupplementaryRoleNotFoundException()
    }

    fun isSupplementaryRoleAssigned(participant: Participant, role: SupplementaryRole): Boolean {
        return mappingRepository.isSupplementaryRoleAssigned(participant, role)
    }

    fun assignSupplementaryRole(role: SupplementaryRole, participant: Participant, assigner: Participant) {
        if (role.id in participant.supplementaryRoles.map { it.id }) {
            throw AssignedSupplementaryRoleException()
        }
        if (role.course.id != participant.course.id) {
            throw CourseMismatchException()
        }

        val mapping = mappingRepository.save(ParticipantSupplementaryRoleMapping(role, participant, assigner))
        role.participantMappings.add(mapping)
        participant.supplementaryRoleMappings.add(mapping)
    }

    fun createSupplementaryRole(course: Course, name: String, permissions: List<HorusPermission>): SupplementaryRole {
        if (name.isBlank()) {
            throw EmptyStringException()
        }
        val role = supplementaryRoleRepository.save(SupplementaryRole(name, course))
        permissions.forEach { addPermissionToRole(role, it) }
        return role
    }

    fun addPermissionToRole(role: SupplementaryRole, horusPermission: HorusPermission) {
        val newString = horusPermission.toString()
        val existingStrings = role.permissions.map { it.name }
        if (newString in existingStrings) {
            throw PermissionAlreadyGrantedException()
        }
        val permission = permissionRepository.findByIdOrNull(newString) ?: throw PermissionNotFoundException()
        val rolePermission = supplementaryRolePermissionRepository.save(SupplementaryRolePermission(role, permission))
        role.supplementaryRolePermissions.add(rolePermission)
        permission.supplementaryRolePermissions.add(rolePermission)
    }

    fun removeSupplementaryRole(role: SupplementaryRole, participant: Participant) {
        val mapping = participant.supplementaryRoleMappings
                .firstOrNull { it.supplementaryRole.id == role.id } ?: throw SupplementaryRoleNotAssignedException()
        role.participantMappings.remove(mapping)
        participant.supplementaryRoleMappings.remove(mapping)
        mappingRepository.delete(mapping)
    }
}