package nl.utwente.horus.services.auth

import nl.utwente.horus.entities.person.Person
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class HorusUserDetails(val person: Person) : UserDetails {

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return person.getAuthorities()
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