package nl.utwente.horus.services.auth

import nl.utwente.horus.entities.auth.AuthCode
import nl.utwente.horus.entities.auth.AuthCodeRepository
import nl.utwente.horus.entities.person.Person
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class AuthCodeService {

    @Autowired
    private lateinit var authCodeRepository: AuthCodeRepository

    fun getAuthCodeByCode(code: String): AuthCode? {
        return authCodeRepository.findByIdOrNull(code)
    }

    fun createAuthCode(code: String, person: Person): AuthCode {
        val code = AuthCode(code, person)
        authCodeRepository.save(code)
        return code
    }

    fun deleteAuthCode(code: AuthCode) {
        authCodeRepository.delete(code)
    }
}