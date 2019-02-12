package nl.utwente.horus.representations.person

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.representations.participant.ParticipantDto

class PersonDtoFull : PersonDtoBrief {
    val participations: MutableSet<ParticipantDto>

    constructor(person: Person) : super(person) {
        this.participations = person.participations.map { ParticipantDto(it) }.toMutableSet()
    }
}