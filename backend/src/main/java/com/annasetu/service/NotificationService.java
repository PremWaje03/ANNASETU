package com.annasetu.service;

import com.annasetu.dto.notification.NotificationPayload;
import com.annasetu.dto.notification.NotificationResponse;
import com.annasetu.exception.ResourceNotFoundException;
import com.annasetu.model.FoodDonation;
import com.annasetu.model.Notification;
import com.annasetu.model.RequestStatus;
import com.annasetu.model.Role;
import com.annasetu.model.User;
import com.annasetu.repository.NotificationRepository;
import com.annasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void notifyNearbyUsersForDonation(FoodDonation donation) {
        List<User> recipients = userRepository.findByRoleIn(List.of(Role.NGO, Role.VOLUNTEER));

        for (User recipient : recipients) {
            if (recipient.getLatitude() == null || recipient.getLongitude() == null) {
                continue;
            }

            double distance = GeoUtils.distanceKm(
                    donation.getLatitude(),
                    donation.getLongitude(),
                    recipient.getLatitude(),
                    recipient.getLongitude()
            );

            if (distance <= 20.0) {
                String message = "New donation available nearby: " + donation.getFoodName() + " (" + donation.getQuantity() + ")";
                pushNotification(recipient.getId(), message, "NEW_DONATION", donation.getId());
            }
        }

        messagingTemplate.convertAndSend("/topic/donations/new", Map.of(
                "donationId", donation.getId(),
                "foodName", donation.getFoodName(),
                "quantity", donation.getQuantity(),
                "location", donation.getLocation(),
                "latitude", donation.getLatitude(),
                "longitude", donation.getLongitude()
        ));
    }

    @Transactional
    public void notifyDonorRequestAccepted(FoodDonation donation, User acceptedBy) {
        String message = "Your donation '" + donation.getFoodName() + "' was accepted by " + acceptedBy.getName();
        pushNotification(donation.getDonor().getId(), message, "REQUEST_ACCEPTED", donation.getId());
    }

    @Transactional
    public void notifyDonorStatusUpdate(FoodDonation donation, RequestStatus status) {
        String message = "Donation '" + donation.getFoodName() + "' status updated to " + status;
        pushNotification(donation.getDonor().getId(), message, "STATUS_UPDATE", donation.getId());
    }

    @Transactional
    public void notifyExpiryAlert(FoodDonation donation) {
        long remainingMinutes = Math.max(0L, Duration.between(LocalDateTime.now(), donation.getExpiryTime()).toMinutes());
        String message = "URGENT: '" + donation.getFoodName() + "' expires in about " + remainingMinutes + " minutes.";

        Set<Long> recipientIds = new HashSet<>();
        recipientIds.add(donation.getDonor().getId());

        List<User> responders = userRepository.findByRoleIn(List.of(Role.NGO, Role.VOLUNTEER));
        for (User user : responders) {
            if (user.getLatitude() == null || user.getLongitude() == null) {
                continue;
            }

            double distance = GeoUtils.distanceKm(
                    donation.getLatitude(),
                    donation.getLongitude(),
                    user.getLatitude(),
                    user.getLongitude()
            );

            if (distance <= 25.0) {
                recipientIds.add(user.getId());
            }
        }

        for (Long userId : recipientIds) {
            pushNotification(userId, message, "EXPIRY_ALERT", donation.getId());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private void pushNotification(Long userId, String message, String type, Long donationId) {
        Notification notification = saveNotification(userId, message);

        NotificationPayload payload = NotificationPayload.builder()
                .notificationId(notification.getId())
                .message(notification.getMessage())
                .userId(notification.getUserId())
                .isRead(notification.getIsRead())
                .type(type)
                .donationId(donationId)
                .createdAt(notification.getCreatedAt())
                .build();

        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", payload);
    }

    private Notification saveNotification(Long userId, String message) {
        Notification notification = Notification.builder()
                .message(message)
                .userId(userId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .userId(notification.getUserId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
