package com.annasetu.dto.donation;

import com.annasetu.model.DonationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DonationResponse {
    private Long id;
    private String foodName;
    private Integer quantity;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalDateTime expiryTime;
    private DonationStatus status;
    private Long donorId;
    private String donorName;
    private String imageUrl;
    private Double distanceKm;
    private Boolean bestMatch;
    private Boolean urgent;
    private Long remainingMinutes;
}
