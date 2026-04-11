package com.annasetu.dto.notification;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private String message;
    private Long userId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
