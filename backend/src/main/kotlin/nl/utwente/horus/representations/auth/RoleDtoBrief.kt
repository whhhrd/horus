package nl.utwente.horus.representations.auth

import nl.utwente.horus.entities.auth.Role

open class RoleDtoBrief {
    val id: Long
    val name: String

    constructor(id: Long, name: String) {
        this.id = id
        this.name = name
    }

    constructor(role: Role) : this(role.id, role.name)
}