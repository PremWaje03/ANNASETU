package com.annasetu.controller;

import com.annasetu.dto.user.UpdateLocationRequest;
import com.annasetu.dto.user.UserProfileSummaryResponse;
import com.annasetu.model.User;
import com.annasetu.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileSummaryResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getMyProfileSummary(currentUser.getId()));
    }

    @PutMapping("/location")
    public ResponseEntity<UserProfileSummaryResponse> updateLocation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        return ResponseEntity.ok(userService.updateMyLocation(currentUser.getId(), request));
    }
}
