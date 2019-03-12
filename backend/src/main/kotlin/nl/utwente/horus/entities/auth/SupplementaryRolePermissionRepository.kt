package nl.utwente.horus.entities.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
interface SupplementaryRolePermissionRepository: JpaRepository<SupplementaryRolePermission,
        SupplementaryRolePermission.SupplementaryRolePermissionId> {
}