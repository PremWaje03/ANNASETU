package com.annasetu.controller;

import com.annasetu.dto.donation.CreateDonationRequest;
import com.annasetu.dto.donation.DonationResponse;
import com.annasetu.dto.donation.DonationStatsResponse;
import com.annasetu.exception.BadRequestException;
import com.annasetu.model.DonationStatus;
import com.annasetu.model.User;
import com.annasetu.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<DonationResponse> createDonation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateDonationRequest request
    ) {
        DonationResponse response = donationService.createDonation(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DonationResponse>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<DonationResponse>> getNearbyDonations(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10") double radiusKm
    ) {
        return ResponseEntity.ok(donationService.getNearbyDonations(latitude, longitude, radiusKm));
    }

    @GetMapping("/nearest")
    public ResponseEntity<List<DonationResponse>> getNearestDonations(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(donationService.getNearestDonations(currentUser.getId(), latitude, longitude, limit));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DonationResponse>> searchDonations(
            @RequestParam(required = false) String foodType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status
    ) {
        DonationStatus donationStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                donationStatus = DonationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid status. Use: PENDING, ACCEPTED, PICKED, DELIVERED");
            }
        }

        return ResponseEntity.ok(donationService.searchDonations(foodType, location, donationStatus));
    }

    @GetMapping("/stats")
    public ResponseEntity<DonationStatsResponse> getDonationStats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(donationService.getDonationStats(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponse> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }
}
