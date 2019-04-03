package nl.utwente.horus.auth.util

import org.springframework.security.crypto.codec.Hex
import java.security.SecureRandom

class RandomStringUtil {

    companion object {

        fun secureRandomHexString(length: Int): String {
            val bytes = ByteArray(length)
            SecureRandom.getInstance("SHA1PRNG").nextBytes(bytes)
            return String(Hex.encode(bytes))
        }

    }

}