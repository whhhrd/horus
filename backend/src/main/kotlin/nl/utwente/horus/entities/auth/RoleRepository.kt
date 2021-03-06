package nl.utwente.horus.entities.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface RoleRepository: JpaRepository<Role, Long> {
    fun findByName(name: String): Role?
}