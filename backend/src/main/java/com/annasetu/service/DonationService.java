package com.annasetu.service;

import com.annasetu.dto.donation.CreateDonationRequest;
import com.annasetu.dto.donation.DonationResponse;
import com.annasetu.dto.donation.DonationStatsResponse;
import com.annasetu.exception.BadRequestException;
import com.annasetu.exception.ResourceNotFoundException;
import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import com.annasetu.model.Role;
import com.annasetu.model.User;
import com.annasetu.repository.FoodDonationRepository;
import com.annasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MatchingService matchingService;
    private final AnalyticsService analyticsService;

    @Transactional
    public DonationResponse createDonation(Long donorId, CreateDonationRequest request) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        if (donor.getRole() != Role.DONOR) {
            throw new BadRequestException("Only users with DONOR role can create donations");
        }

        if (request.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiry time must be in the future");
        }

        FoodDonation donation = FoodDonation.builder()
                .foodName(request.getFoodName())
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .expiryTime(request.getExpiryTime())
                .imageUrl(request.getImageUrl())
                .expiryAlertSent(false)
                .status(DonationStatus.PENDING)
                .donor(donor)
                .build();

        FoodDonation saved = donationRepository.save(donation);
        notificationService.notifyNearbyUsersForDonation(saved);
        return toResponse(saved, null, false);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAllDonations() {
        return donationRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(FoodDonation::getId).reversed())
                .map(donation -> toResponse(donation, null, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getNearbyDonations(double latitude, double longitude, double radiusKm) {
        return donationRepository.findByStatus(DonationStatus.PENDING)
                .stream()
                .filter(donation -> donation.getExpiryTime().isAfter(LocalDateTime.now()))
                .map(donation -> {
                    double distance = GeoUtils.distanceKm(latitude, longitude, donation.getLatitude(), donation.getLongitude());
                    return new MatchingService.MatchedDonation(donation, distance);
                })
                .filter(matched -> matched.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparing(MatchingService.MatchedDonation::getDistanceKm))
                .map(matched -> toResponse(matched.getDonation(), matched.getDistanceKm(), false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getNearestDonations(Long userId, Double latitude, Double longitude, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        double sourceLat = latitude != null ? latitude : resolveCoordinate(user.getLatitude(), "latitude");
        double sourceLng = longitude != null ? longitude : resolveCoordinate(user.getLongitude(), "longitude");

        List<MatchingService.MatchedDonation> nearest = matchingService.findNearestDonations(sourceLat, sourceLng, limit);

        return java.util.stream.IntStream.range(0, nearest.size())
                .mapToObj(index -> {
                    MatchingService.MatchedDonation matched = nearest.get(index);
                    return toResponse(matched.getDonation(), matched.getDistanceKm(), index == 0);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> searchDonations(String foodType, String location, DonationStatus status) {
        String normalizedFoodType = normalizeString(foodType);
        String normalizedLocation = normalizeString(location);

        return donationRepository.search(normalizedFoodType, normalizedLocation, status)
                .stream()
                .sorted(Comparator.comparing(FoodDonation::getId).reversed())
                .map(donation -> toResponse(donation, null, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationStatsResponse getDonationStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return analyticsService.getDonationStats(user);
    }

    @Transactional(readOnly = true)
    public DonationResponse getDonationById(Long id) {
        FoodDonation donation = getDonationEntityById(id);
        return toResponse(donation, null, false);
    }

    @Transactional(readOnly = true)
    public FoodDonation getDonationEntityById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
    }

    private String normalizeString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private double resolveCoordinate(Double value, String name) {
        if (value == null) {
            throw new BadRequestException("User " + name + " is not set. Share location or pass query parameters.");
        }
        return value;
    }

    private DonationResponse toResponse(FoodDonation donation, Double distanceKm, boolean bestMatch) {
        long remainingMinutes = Math.max(0L, Duration.between(LocalDateTime.now(), donation.getExpiryTime()).toMinutes());
        boolean urgent = remainingMinutes <= 60 && donation.getStatus() != DonationStatus.DELIVERED;

        return DonationResponse.builder()
                .id(donation.getId())
                .foodName(donation.getFoodName())
                .quantity(donation.getQuantity())
                .location(donation.getLocation())
                .latitude(donation.getLatitude())
                .longitude(donation.getLongitude())
                .expiryTime(donation.getExpiryTime())
                .status(donation.getStatus())
                .donorId(donation.getDonor().getId())
                .donorName(donation.getDonor().getName())
                .imageUrl(donation.getImageUrl())
                .distanceKm(distanceKm)
                .bestMatch(bestMatch)
                .urgent(urgent)
                .remainingMinutes(remainingMinutes)
                .build();
    }
}
