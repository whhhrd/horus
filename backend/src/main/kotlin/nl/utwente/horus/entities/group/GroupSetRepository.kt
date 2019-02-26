package nl.utwente.horus.entities.group

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface GroupSetRepository: JpaRepository<GroupSet, Long> {

    fun getGroupSetByExternalId(externalId: String): GroupSet?

}