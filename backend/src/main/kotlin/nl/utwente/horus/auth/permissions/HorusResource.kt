package nl.utwente.horus.auth.permissions

enum class HorusResource {

    PERSON,

    COURSE,
    COURSE_PARTICIPANT,

    COURSE_GROUPSET,
    COURSE_GROUP,
    COURSE_GROUPMEMBER,

    COURSE_ASSIGNMENTSET,

    COURSE_COMMENT_STAFFONLY,
    COURSE_COMMENT_PUBLIC,

    COURSE_SIGNOFFRESULT;

    companion object {
        const val COURSE_PREFIX = "COURSE"
    }
}