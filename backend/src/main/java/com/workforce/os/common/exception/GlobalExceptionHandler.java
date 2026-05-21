package com.workforce.os.common.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static com.workforce.os.common.util.MessageConstants.*;

@ControllerAdvice
@lombok.extern.slf4j.Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(VALIDATION_FAILED)
                .message(INPUT_VALIDATION_ERROR)
                .details(errors)
                .build()
        );
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, INVALID_EMAIL_OR_PASSWORD);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        log.error("Unexpected error occurred: ", ex);
        
        // If it's a known business or resource error, it would have been caught above.
        // For everything else, return a generic but professional message to the frontend.
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(
            ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .success(false)
                .build()
        );
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String message;
        private boolean success;
        private Object details;
    }
}
