package com.annasetu.service;

import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import com.annasetu.repository.FoodDonationRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final FoodDonationRepository donationRepository;

    public List<MatchedDonation> findNearestDonations(double latitude, double longitude, int limit) {
        int normalizedLimit = Math.max(1, Math.min(limit, 50));

        return donationRepository
                .findByStatusInAndExpiryTimeAfter(List.of(DonationStatus.PENDING), LocalDateTime.now())
                .stream()
                .map(donation -> new MatchedDonation(
                        donation,
                        GeoUtils.distanceKm(latitude, longitude, donation.getLatitude(), donation.getLongitude())
                ))
                .sorted(Comparator.comparing(MatchedDonation::getDistanceKm))
                .limit(normalizedLimit)
                .toList();
    }

    @Getter
    public static class MatchedDonation {
        private final FoodDonation donation;
        private final double distanceKm;

        public MatchedDonation(FoodDonation donation, double distanceKm) {
            this.donation = donation;
            this.distanceKm = distanceKm;
        }
    }
}
