package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

open class ForbiddenException(message: String, code: String? = null) :
        HorusException(message, HttpStatus.FORBIDDEN, code)

class SyncUnauthorizedException : ForbiddenException("Canvas sync not authorized for this user.")

class NoParticipantException : ForbiddenException("You are not a participant in this course.")

class CommentThreadStaffOnly : ForbiddenException("Not authorized to view thread.")