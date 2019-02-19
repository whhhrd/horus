package nl.utwente.horus.services.auth

import nl.utwente.horus.entities.auth.Role
import nl.utwente.horus.entities.auth.RoleRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import javax.management.relation.RoleNotFoundException

@Component
@Transactional
class RoleService {
    @Autowired
    lateinit var roleRepository: RoleRepository

    fun getRoleById(id: Long): Role {
        return roleRepository.findByIdOrNull(id) ?: throw RoleNotFoundException()
    }
}