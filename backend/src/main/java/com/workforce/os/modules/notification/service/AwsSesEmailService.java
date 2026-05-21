package com.workforce.os.modules.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

//@Service
@Slf4j
@ConditionalOnProperty(name = "application.messaging.email-provider", havingValue = "AWS")
public class AwsSesEmailService implements EmailService {

    @Value("${application.messaging.aws.access-key}")
    private String accessKey;

    @Value("${application.messaging.aws.secret-key}")
    private String secretKey;

    @Value("${application.messaging.aws.region}")
    private String region;

    @Value("${application.messaging.aws.from-email}")
    private String fromEmail;

    private SesClient sesClient;

    @PostConstruct
    public void init() {
        sesClient = SesClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        SendEmailRequest request = SendEmailRequest.builder()
                .destination(Destination.builder().toAddresses(to).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).build())
                        .body(Body.builder()
                                .html(Content.builder().data(body).build())
                                .build())
                        .build())
                .source(fromEmail)
                .build();

        try {
            sesClient.sendEmail(request);
            log.info("Email sent successfully to {}", to);
        } catch (SesException e) {
            log.error("Failed to send email via AWS SES to {}: {}", to, e.awsErrorDetails().errorMessage());
        }
    }

    @PreDestroy
    public void cleanup() {
        if (sesClient != null) {
            sesClient.close();
        }
    }
}
