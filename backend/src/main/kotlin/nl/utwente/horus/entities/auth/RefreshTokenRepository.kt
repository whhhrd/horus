package nl.utwente.horus.entities.auth

import org.springframework.data.jpa.repository.JpaRepository
import java.time.ZonedDateTime

interface RefreshTokenRepository: JpaRepository<RefreshToken, String> {

    fun findAllByPersonId(id: Long)

    fun deleteAllByLastUsedAtBeforeOrExpiresAtBefore(lastUsageLimit: ZonedDateTime, expiryLimit: ZonedDateTime)
}