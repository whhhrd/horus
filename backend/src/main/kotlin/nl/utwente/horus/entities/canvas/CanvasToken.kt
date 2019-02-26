package nl.utwente.horus.entities.canvas

import nl.utwente.horus.entities.person.Person
import javax.persistence.*

@Entity
data class CanvasToken(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long,

        @OneToOne
        val person: Person,

        var token: String
) {
    constructor(person: Person, token: String) : this(0, person, token)
}