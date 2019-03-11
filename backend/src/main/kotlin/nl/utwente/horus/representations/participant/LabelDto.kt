package nl.utwente.horus.representations.participant

import nl.utwente.horus.entities.participant.Label

data class LabelDto(
        val id: Long,
        val name: String,
        val color: String
) {
    constructor(label: Label) : this(label.id, label.name, label.color)
}