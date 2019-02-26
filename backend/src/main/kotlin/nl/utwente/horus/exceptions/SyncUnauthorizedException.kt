package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(code = HttpStatus.FORBIDDEN)
class SyncUnauthorizedException : RuntimeException("Canvas sync not authorized for this user")