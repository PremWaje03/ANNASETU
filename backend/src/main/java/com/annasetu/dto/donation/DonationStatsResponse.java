package com.annasetu.dto.donation;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class DonationStatsResponse {
    private Long totalDonations;
    private Long completedDonations;
    private Long pendingDonations;
    private Map<String, Long> statusCounts;
    private List<WeeklyDonationPoint> donationsPerWeek;
}
