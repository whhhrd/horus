package nl.utwente.horus.entities.person

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.representations.auth.HorusAuthority
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class Person(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,
        var loginId: String,
        var fullName: String,
        var shortName: String,
        var email: String?,
        val createdAt: ZonedDateTime
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "person", cascade = [CascadeType.ALL], orphanRemoval = true)
    val participations: MutableSet<Participant> = HashSet()

    constructor(loginId: String, fullName: String, shortName: String, email: String?): this(id = 0, loginId = loginId, shortName = shortName, fullName = fullName, email = email, createdAt = ZonedDateTime.now())

    fun getAuthorities(): HashSet<HorusAuthority> {
       return HashSet(participations.map { part -> part.role.permissions.map { perm -> HorusAuthority(part.course, perm) } }.fold(listOf<HorusAuthority>()) { l1, l2 -> l1 + l2})
    }

}