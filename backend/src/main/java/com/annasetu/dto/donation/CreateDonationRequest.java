package com.annasetu.dto.donation;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateDonationRequest {

    @NotBlank
    private String foodName;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotBlank
    private String location;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotNull
    private LocalDateTime expiryTime;

    private String imageUrl;
}
