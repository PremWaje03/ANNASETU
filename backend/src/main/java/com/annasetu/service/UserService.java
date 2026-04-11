package com.annasetu.service;

import com.annasetu.dto.user.UpdateLocationRequest;
import com.annasetu.dto.user.UserProfileSummaryResponse;
import com.annasetu.exception.ResourceNotFoundException;
import com.annasetu.model.User;
import com.annasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;

    @Transactional
    public UserProfileSummaryResponse updateMyLocation(Long userId, UpdateLocationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        userRepository.save(user);

        return analyticsService.getProfileSummary(user);
    }

    @Transactional(readOnly = true)
    public UserProfileSummaryResponse getMyProfileSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return analyticsService.getProfileSummary(user);
    }
}
