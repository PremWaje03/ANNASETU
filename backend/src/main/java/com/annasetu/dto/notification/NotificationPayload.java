package com.annasetu.dto.notification;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationPayload {
    private Long notificationId;
    private String message;
    private Long userId;
    private Boolean isRead;
    private String type;
    private Long donationId;
    private LocalDateTime createdAt;
}
