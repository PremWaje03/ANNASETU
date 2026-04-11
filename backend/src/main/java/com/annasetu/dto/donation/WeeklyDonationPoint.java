package com.annasetu.dto.donation;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WeeklyDonationPoint {
    private String week;
    private Long count;
}
