package nl.utwente.horus.entities.comment

import nl.utwente.horus.entities.participant.Participant
import javax.persistence.*

@Entity
class CommentThread(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @Enumerated(value = EnumType.STRING)
        val type: CommentType,

        @ManyToOne
        @JoinColumn(name = "author")
        val author: Participant
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "thread", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("createdAt ASC")
    val comments: MutableSet<Comment> = HashSet()

    constructor(author: Participant, type: CommentType) : this(0, type, author)

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Participant

        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

}