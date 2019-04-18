package nl.utwente.horus.representations.person

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.representations.auth.HorusAuthorityDto
import nl.utwente.horus.representations.participant.ParticipantDtoFull

class PersonDtoFull : PersonDtoBrief {
    val participations: List<ParticipantDtoFull>
    val authorities: List<HorusAuthorityDto>

    constructor(person: Person) : super(person) {
        this.participations = person.enabledParticipations.map { ParticipantDtoFull(it) }
        this.authorities = person.getAuthorities().map { HorusAuthorityDto(it) }
    }
}