package com.annasetu.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private String role;
    private Long totalDonations;
    private Long activeDonations;
    private Long completedDonations;
    private Long nearbyDonations;
    private Long acceptedRequests;
    private Long completedPickups;
}
