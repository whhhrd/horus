package nl.utwente.horus.entities.comment

import javax.persistence.*

@Entity
data class CommentThread(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        val type: CommentType
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "thread", cascade = [CascadeType.ALL], orphanRemoval = true)
    val comments: MutableSet<Comment> = HashSet()

    constructor(type: CommentType) : this(0, type)
}