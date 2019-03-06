package nl.utwente.horus.services.auth

import nl.utwente.horus.auth.permissions.HorusAuthority
import nl.utwente.horus.entities.person.Person
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class HorusUserDetails(val person: Person) : UserDetails {

    // This makes the lazy load explicit when a user details object is initialized,
    // and makes authorities usable by classes outside of the Spring/JPA sessions system.
    val horusAuthorities: Collection<HorusAuthority> = person.getAuthorities()

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return HashSet(horusAuthorities)
    }

    override fun isEnabled(): Boolean {
        return true
    }

    override fun getUsername(): String {
        return person.loginId
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun getPassword(): String {
        throw UnsupportedOperationException()
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }
}