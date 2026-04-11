package com.annasetu.dto.request;

import com.annasetu.model.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRequestStatusDto {

    @NotNull
    private Long requestId;

    @NotNull
    private RequestStatus status;
}
