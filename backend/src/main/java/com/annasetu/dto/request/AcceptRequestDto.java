package com.annasetu.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AcceptRequestDto {

    @NotNull
    private Long donationId;
}
