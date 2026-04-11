package com.annasetu.dto.feedback;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeedbackResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
}
