package nl.utwente.horus.representations.queuing.updates

enum class UpdateType {
    INITIAL,
    ENQUEUE,
    DEQUEUE,
    ADD_QUEUE,
    EDIT_QUEUE,
    REMOVE_QUEUE,
    CLOSE_ROOM,
    ADD_ANNOUNCEMENT,
    REMOVE_ANNOUNCEMENT,
    REMIND,
    ACCEPT
}