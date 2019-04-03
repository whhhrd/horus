package nl.utwente.horus.services.auth

import nl.utwente.horus.HorusConfigurationProperties
import nl.utwente.horus.entities.auth.RefreshToken
import nl.utwente.horus.entities.auth.RefreshTokenRepository
import nl.utwente.horus.entities.person.Person
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Component
@Transactional
class RefreshTokenService {

    @Autowired
    private lateinit var refreshTokenRepository: RefreshTokenRepository

    @Autowired
    private lateinit var configurationProperties: HorusConfigurationProperties

    fun getById(id: String): RefreshToken? {
        return refreshTokenRepository.findByIdOrNull(id)
    }

    fun getAllByPersonId(id: Long) {
        return refreshTokenRepository.findAllByPersonId(id)
    }

    fun saveNew(id: String, person: Person, clientId: String?, issuedAt: ZonedDateTime, expiresAt: ZonedDateTime): RefreshToken {
        val refreshToken = RefreshToken(id, person, clientId, issuedAt, expiresAt, issuedAt)
        refreshTokenRepository.save(refreshToken)
        return refreshToken
    }

    fun deleteById(id: String) {
        return refreshTokenRepository.deleteById(id)
    }

    @Scheduled(fixedRate = 1000 * 3600)
    fun cleanTokens() {
        val now = ZonedDateTime.now()
        refreshTokenRepository.deleteAllByLastUsedAtBeforeOrExpiresAtBefore(now.minusSeconds(configurationProperties.refreshTokenFreshnessDuration), now)
    }
}