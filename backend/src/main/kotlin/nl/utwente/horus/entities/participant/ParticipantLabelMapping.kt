package nl.utwente.horus.entities.participant

import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@Table(name = "participant_label_mapping")
data class ParticipantLabelMapping(
        @EmbeddedId
        private val id: ParticipantLabelMappingId,

        @ManyToOne
        @JoinColumn(name = "assigned_by")
        val assignedBy: Participant,

        val assignedAt: ZonedDateTime
) {
    @Embeddable
    data class ParticipantLabelMappingId(
            @ManyToOne
            val participant: Participant,

            @ManyToOne
            val label: Label
    ) : Serializable

    constructor(participant: Participant, label: Label, assignedBy: Participant) :
            this(ParticipantLabelMappingId(participant, label), assignedBy, ZonedDateTime.now())

    val participant
        get() = this.id.participant

    val label
        get() = this.id.label
}