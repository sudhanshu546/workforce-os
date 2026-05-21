package com.workforce.os.modules.notification.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
