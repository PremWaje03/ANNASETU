package com.annasetu.controller;

import com.annasetu.dto.request.AcceptRequestDto;
import com.annasetu.dto.request.RequestResponse;
import com.annasetu.dto.request.UpdateRequestStatusDto;
import com.annasetu.model.User;
import com.annasetu.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping("/accept")
    public ResponseEntity<RequestResponse> acceptRequest(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AcceptRequestDto request
    ) {
        return ResponseEntity.ok(requestService.acceptDonation(currentUser.getId(), request));
    }

    @PutMapping("/status")
    public ResponseEntity<RequestResponse> updateStatus(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateRequestStatusDto request
    ) {
        return ResponseEntity.ok(requestService.updateStatus(currentUser.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RequestResponse>> getMyRequests(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.getMyRequests(currentUser.getId()));
    }
}
