package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.course.Course
import javax.persistence.*

@Entity
data class SupplementaryRole (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        val name: String,

        @ManyToOne
        val course: Course
) {

    constructor(name: String, course: Course) : this(0, name, course)

    @OneToMany(mappedBy = "id.supplementaryRole", cascade = [CascadeType.ALL], orphanRemoval = true)
    val supplementaryRolePermissions: MutableSet<SupplementaryRolePermission> = HashSet()

    @OneToMany(mappedBy = "id.supplementaryRole", cascade = [CascadeType.ALL], orphanRemoval = true)
    val participantMappings: MutableSet<ParticipantSupplementaryRoleMapping> = HashSet()

    val permissions: List<Permission>
        get() = supplementaryRolePermissions.map { rp -> rp.permission }
}