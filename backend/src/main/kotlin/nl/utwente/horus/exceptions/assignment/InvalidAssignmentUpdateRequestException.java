package nl.utwente.horus.exceptions.assignment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAssignmentUpdateRequestException extends RuntimeException {
    public InvalidAssignmentUpdateRequestException(String message) {
        super(message);
    }
}
