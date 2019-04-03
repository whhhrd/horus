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

    companion object {
        const val STUDENT_ROLE_NAME = "STUDENT"
        const val TA_ROLE_NAME = "TEACHING_ASSISTANT"
        const val TEACHER_ROLE_NAME = "TEACHER"
    }

    fun getRoleById(id: Long): Role {
        return roleRepository.findByIdOrNull(id) ?: throw RoleNotFoundException()
    }

    fun getRoleByName(name: String): Role {
        return roleRepository.findByName(name) ?: throw RoleNotFoundException()
    }

    fun getTeacherRole(): Role {
        return getRoleByName(Role.TEACHER)
    }

    fun getTaRole(): Role {
        return getRoleByName(Role.TEACHING_ASSISTANT)
    }

    fun getStudentRole(): Role {
        return getRoleByName(Role.STUDENT)
    }


}