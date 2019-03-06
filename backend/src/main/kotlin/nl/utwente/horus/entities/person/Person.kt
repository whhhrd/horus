package nl.utwente.horus.entities.person

import nl.utwente.horus.auth.permissions.HorusAuthority
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.entities.participant.Participant
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

    fun getAuthorities(): Collection<HorusAuthority> {
        val authorities = participations.map { part -> part.role.permissions.map { perm -> HorusAuthority(listOf(part.course), perm) } }.flatten()
        val permissionCourseMap = HashMap<HorusPermission, MutableSet<Long>>()
        authorities.forEach {
            if (permissionCourseMap.containsKey(it.permission)) {
                permissionCourseMap[it.permission]!!.addAll(it.courseIds)
            } else {
                permissionCourseMap[it.permission] = HashSet(it.courseIds)
            }
        }
        return permissionCourseMap.map { HorusAuthority(it.value, it.key) }
    }

}