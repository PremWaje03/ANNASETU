package com.annasetu.service;

import com.annasetu.dto.donation.DonationStatsResponse;
import com.annasetu.dto.donation.WeeklyDonationPoint;
import com.annasetu.dto.user.UserProfileSummaryResponse;
import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import com.annasetu.model.RequestStatus;
import com.annasetu.model.Role;
import com.annasetu.model.User;
import com.annasetu.repository.DonationRequestRepository;
import com.annasetu.repository.FoodDonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final FoodDonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;

    public DonationStatsResponse getDonationStats(User user) {
        List<FoodDonation> scopedDonations = getScopedDonations(user);

        long total = scopedDonations.size();
        long completed = scopedDonations.stream().filter(d -> d.getStatus() == DonationStatus.DELIVERED).count();
        long pending = scopedDonations.stream().filter(d -> d.getStatus() == DonationStatus.PENDING).count();

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (DonationStatus status : DonationStatus.values()) {
            long count = scopedDonations.stream().filter(d -> d.getStatus() == status).count();
            statusCounts.put(status.name(), count);
        }

        List<WeeklyDonationPoint> weeklyPoints = buildWeeklySeries(scopedDonations);

        return DonationStatsResponse.builder()
                .totalDonations(total)
                .completedDonations(completed)
                .pendingDonations(pending)
                .statusCounts(statusCounts)
                .donationsPerWeek(weeklyPoints)
                .build();
    }

    public UserProfileSummaryResponse getProfileSummary(User user) {
        long totalDonations;
        long completedDonations;
        long acceptedRequests;
        long completedPickups;

        if (user.getRole() == Role.DONOR) {
            totalDonations = donationRepository.countByDonorId(user.getId());
            completedDonations = donationRepository.countByDonorIdAndStatusIn(user.getId(), List.of(DonationStatus.DELIVERED));
            acceptedRequests = 0L;
            completedPickups = 0L;
        } else {
            totalDonations = 0L;
            completedDonations = 0L;
            acceptedRequests = requestRepository.countByVolunteerId(user.getId());
            completedPickups = requestRepository.countByVolunteerIdAndStatus(user.getId(), RequestStatus.DELIVERED);
        }

        return UserProfileSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .totalDonations(totalDonations)
                .completedDonations(completedDonations)
                .acceptedRequests(acceptedRequests)
                .completedPickups(completedPickups)
                .build();
    }

    private List<FoodDonation> getScopedDonations(User user) {
        if (user.getRole() == Role.DONOR) {
            return donationRepository.findByDonorId(user.getId());
        }
        return donationRepository.findAll();
    }

    private List<WeeklyDonationPoint> buildWeeklySeries(List<FoodDonation> donations) {
        LocalDate now = LocalDate.now();

        return java.util.stream.IntStream.rangeClosed(0, 7)
                .mapToObj(index -> {
                    LocalDate weekStart = now.minusWeeks(7L - index).with(DayOfWeek.MONDAY);
                    LocalDate weekEnd = weekStart.plusDays(6);

                    long count = donations.stream()
                            .map(this::resolveDonationDate)
                            .filter(date -> !date.isBefore(weekStart) && !date.isAfter(weekEnd))
                            .count();

                    String label = weekStart.getYear() + "-W" + weekStart.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());

                    return WeeklyDonationPoint.builder()
                            .week(label)
                            .count(count)
                            .build();
                })
                .toList();
    }

    private LocalDate resolveDonationDate(FoodDonation donation) {
        LocalDateTime createdAt = donation.getCreatedAt();
        if (createdAt != null) {
            return createdAt.toLocalDate();
        }
        return donation.getExpiryTime().toLocalDate();
    }
}
