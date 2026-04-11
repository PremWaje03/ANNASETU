package com.annasetu.dto.user;

import com.annasetu.model.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Double latitude;
    private Double longitude;
    private Long totalDonations;
    private Long completedDonations;
    private Long acceptedRequests;
    private Long completedPickups;
}
