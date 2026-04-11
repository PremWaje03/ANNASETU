package com.annasetu.service;

import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import com.annasetu.repository.FoodDonationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpiryAlertScheduler {

    private final FoodDonationRepository donationRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRateString = "${app.expiry.scheduler-ms:60000}")
    @Transactional
    public void sendExpiryAlerts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusHours(1);

        List<FoodDonation> expiringSoon = donationRepository.findByExpiryAlertSentFalseAndExpiryTimeBetweenAndStatusIn(
                now,
                threshold,
                List.of(DonationStatus.PENDING, DonationStatus.ACCEPTED, DonationStatus.PICKED)
        );

        for (FoodDonation donation : expiringSoon) {
            notificationService.notifyExpiryAlert(donation);
            donation.setExpiryAlertSent(true);
            donationRepository.save(donation);
        }

        if (!expiringSoon.isEmpty()) {
            log.info("Sent {} expiry alerts", expiringSoon.size());
        }
    }
}
