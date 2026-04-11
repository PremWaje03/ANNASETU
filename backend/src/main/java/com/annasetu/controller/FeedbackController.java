package com.annasetu.controller;

import com.annasetu.dto.feedback.FeedbackRequest;
import com.annasetu.dto.feedback.FeedbackResponse;
import com.annasetu.model.User;
import com.annasetu.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> createFeedback(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody FeedbackRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.createFeedback(currentUser.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
