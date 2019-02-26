package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

abstract class EntityNotFoundException(message: String, code: String? = null) : HorusException(message, HttpStatus.NOT_FOUND, code)

class CommentNotFoundException : EntityNotFoundException("Comment could not be found.")

class CommentThreadNotFoundException : EntityNotFoundException("Comment thread could not be found.")

class PersonNotFoundException: EntityNotFoundException("Person could not be found.")

class RoleNotFoundException : EntityNotFoundException("Role could not be found.")

class CourseNotFoundException : EntityNotFoundException("Course could not be found.")

class AssignmentSetNotFoundException : EntityNotFoundException("Assignment set could not be found.")

class ParticipantNotFoundException : EntityNotFoundException("Participant in course could not be found.")

class GroupNotFoundException : EntityNotFoundException("Group could not be found.")

class GroupSetNotFoundException : EntityNotFoundException("Group set could not be found.")