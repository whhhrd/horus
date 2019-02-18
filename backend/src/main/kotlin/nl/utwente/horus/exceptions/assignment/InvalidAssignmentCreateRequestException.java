package nl.utwente.horus.exceptions.assignment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAssignmentCreateRequestException extends RuntimeException {
    public InvalidAssignmentCreateRequestException(String message) {
        super(message);
    }
}
