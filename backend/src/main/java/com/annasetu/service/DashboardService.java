package com.annasetu.service;

import com.annasetu.dto.dashboard.DashboardStatsResponse;
import com.annasetu.model.DonationStatus;
import com.annasetu.model.RequestStatus;
import com.annasetu.model.Role;
import com.annasetu.model.User;
import com.annasetu.repository.DonationRequestRepository;
import com.annasetu.repository.FoodDonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FoodDonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final MatchingService matchingService;

    public DashboardStatsResponse getStats(User user) {
        if (user.getRole() == Role.DONOR) {
            long total = donationRepository.countByDonorId(user.getId());
            long active = donationRepository.countByDonorIdAndStatusIn(
                    user.getId(),
                    List.of(DonationStatus.PENDING, DonationStatus.ACCEPTED, DonationStatus.PICKED)
            );
            long completed = donationRepository.countByDonorIdAndStatusIn(
                    user.getId(),
                    List.of(DonationStatus.DELIVERED)
            );

            return DashboardStatsResponse.builder()
                    .role(user.getRole().name())
                    .totalDonations(total)
                    .activeDonations(active)
                    .completedDonations(completed)
                    .nearbyDonations(0L)
                    .acceptedRequests(0L)
                    .completedPickups(0L)
                    .build();
        }

        long nearby = 0;
        if (user.getLatitude() != null && user.getLongitude() != null) {
            nearby = matchingService.findNearestDonations(user.getLatitude(), user.getLongitude(), 25).size();
        }

        long acceptedRequests = requestRepository.countByVolunteerId(user.getId());
        long completedPickups = requestRepository.countByVolunteerIdAndStatus(user.getId(), RequestStatus.DELIVERED);
        long activeRequests = Math.max(0L, acceptedRequests - completedPickups);

        return DashboardStatsResponse.builder()
                .role(user.getRole().name())
                .totalDonations(0L)
                .activeDonations(activeRequests)
                .completedDonations(0L)
                .nearbyDonations(nearby)
                .acceptedRequests(acceptedRequests)
                .completedPickups(completedPickups)
                .build();
    }
}
