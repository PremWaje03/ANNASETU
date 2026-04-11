package com.annasetu.dto.request;

import com.annasetu.model.DonationStatus;
import com.annasetu.model.RequestStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RequestResponse {
    private Long id;
    private Long donationId;
    private String foodName;
    private Long volunteerId;
    private String volunteerName;
    private RequestStatus status;
    private DonationStatus donationStatus;
}
