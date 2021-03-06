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
        var sortableName: String,
        var email: String?,
        val createdAt: ZonedDateTime
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "person", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val participations: MutableSet<Participant> = HashSet()

    val enabledParticipations
        get() = participations.filter { it.enabled }

    val disabledParticipations
        get() = participations.filter { !it.enabled }

    val enabledAndDisabledParticipations
        get() = enabledParticipations + disabledParticipations

    constructor(loginId: String, fullName: String, shortName: String, sortableName: String, email: String?): this(id = 0, loginId = loginId, shortName = shortName, fullName = fullName, sortableName = sortableName, email = email, createdAt = ZonedDateTime.now())

    fun getAuthorities(): Collection<HorusAuthority> {
        // Convert both "normal" roles (TA/teacher
        val authorities = enabledParticipations.map { part -> part.role.permissions.map { perm -> HorusAuthority(listOf(part.course), perm) } }.flatten() +
                enabledParticipations.asSequence().map { it.supplementaryRoles }.flatten().map { role -> role.permissions.map { HorusAuthority(listOf(role.course), it) } }.flatten().toList()
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

    fun addParticipation(participant: Participant) {
        participations.add(participant)
    }

}