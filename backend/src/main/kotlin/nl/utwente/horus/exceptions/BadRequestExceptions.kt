package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus

abstract class BadRequestException(message: String, code: String? = null) : HorusException(message, HttpStatus.BAD_REQUEST, code)

// General exception
class EmptyStringException : BadRequestException("A string used for creation/updating of this entity was found to be empty, which is illegal.")

class DuplicateEntityRequestException : BadRequestException("The same entity was requested multiple times in the same request.")

class EmptyListException : BadRequestException("List parameter should have at least one entry.")
// Course-related
class WrongCourseException : BadRequestException("This entity does not belong to the indicated course.")

class EmptySearchQueryException : BadRequestException("No search query provided.")

class CourseMismatchException : BadRequestException("Multiple entities were attempted to be associated, but belong to different courses.")

// Assignment-related
class InvalidAssignmentCreateRequestException(message: String) : BadRequestException(message)

class InvalidAssignmentUpdateRequestException(message: String) : BadRequestException(message)

class InvalidAssignmentGroupSetsMappingCreateRequestException(message: String) : BadRequestException(message)

// Canvas-related
class CanvasTokenNotFoundException : BadRequestException("The action required a Canvas token, " +
        "which is not present for this entity.")

class InvalidCanvasTokenException : BadRequestException("Used Canvas token invalid.")

// Comment-related
class ExistingThreadException : BadRequestException("This entity already has an associated comment thread.")

// Sign-off-related
class AlreadyArchivedException : BadRequestException("This sign-off result has already been marked as archived.")

class DifferentAssignmentSetException : BadRequestException("This request contains assignments which do not belong to the given set ID.")

// Participant-related
class ExistingLabelException : BadRequestException("This participant already contains the to-be-added label.")

class LabelNotLinkedException : BadRequestException("Label could not be found for this participant.")

class InvalidColorException: BadRequestException("Color should be six-character hex string without #-prefix.")

class InvalidLabelNameException : BadRequestException("Label name can only contain (at most 15) alphanumeric characters and hyphens.")

class ExistingLabelNameException : BadRequestException("Label name is already taken for this course.")

// Roles/permissions related
class AssignedSupplementaryRoleException: BadRequestException("Supplementary role is already assigned.")

class SupplementaryRoleNotAssignedException : BadRequestException("Supplementary role was requested to be removed, but no assignment was found.")

class PermissionAlreadyGrantedException : BadRequestException("This permission was already granted to this (supplementary) role.")