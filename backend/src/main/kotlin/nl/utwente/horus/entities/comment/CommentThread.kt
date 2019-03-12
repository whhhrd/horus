package nl.utwente.horus.entities.comment

import javax.persistence.*

@Entity
data class CommentThread(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @Enumerated(value = EnumType.STRING)
        val type: CommentType
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "thread", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("createdAt ASC")
    val comments: MutableSet<Comment> = HashSet()

    constructor(type: CommentType) : this(0, type)
}