package nl.utwente.horus.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.lang.RuntimeException

class PersonNotFoundException: EntityNotFoundException()