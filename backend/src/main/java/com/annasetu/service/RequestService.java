package com.annasetu.service;

import com.annasetu.dto.request.AcceptRequestDto;
import com.annasetu.dto.request.RequestResponse;
import com.annasetu.dto.request.UpdateRequestStatusDto;
import com.annasetu.exception.BadRequestException;
import com.annasetu.exception.ResourceNotFoundException;
import com.annasetu.model.DonationRequest;
import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import com.annasetu.model.RequestStatus;
import com.annasetu.model.Role;
import com.annasetu.model.User;
import com.annasetu.repository.DonationRequestRepository;
import com.annasetu.repository.FoodDonationRepository;
import com.annasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final DonationRequestRepository requestRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final DonationService donationService;
    private final NotificationService notificationService;

    @Transactional
    public RequestResponse acceptDonation(Long userId, AcceptRequestDto requestDto) {
        User volunteer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (volunteer.getRole() == Role.DONOR) {
            throw new BadRequestException("Donors cannot accept requests");
        }

        FoodDonation donation = donationService.getDonationEntityById(requestDto.getDonationId());

        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new BadRequestException("Donation is already accepted or completed");
        }

        requestRepository.findByDonationId(donation.getId()).ifPresent(existing -> {
            throw new BadRequestException("Donation already accepted by another user");
        });

        donation.setStatus(DonationStatus.ACCEPTED);
        donationRepository.save(donation);

        DonationRequest donationRequest = DonationRequest.builder()
                .donation(donation)
                .volunteer(volunteer)
                .status(RequestStatus.ACCEPTED)
                .build();

        DonationRequest savedRequest = requestRepository.save(donationRequest);
        notificationService.notifyDonorRequestAccepted(donation, volunteer);

        return toResponse(savedRequest);
    }

    @Transactional
    public RequestResponse updateStatus(Long userId, UpdateRequestStatusDto requestDto) {
        DonationRequest request = requestRepository.findById(requestDto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (!request.getVolunteer().getId().equals(userId)) {
            throw new BadRequestException("You can only update your own request");
        }

        validateTransition(request.getStatus(), requestDto.getStatus());

        request.setStatus(requestDto.getStatus());

        FoodDonation donation = request.getDonation();
        donation.setStatus(DonationStatus.valueOf(requestDto.getStatus().name()));

        requestRepository.save(request);
        donationRepository.save(donation);

        notificationService.notifyDonorStatusUpdate(donation, requestDto.getStatus());

        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> getMyRequests(Long userId) {
        return requestRepository.findByVolunteerId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateTransition(RequestStatus current, RequestStatus next) {
        if (current == RequestStatus.DELIVERED) {
            throw new BadRequestException("Delivered request cannot be modified");
        }

        if (current == RequestStatus.ACCEPTED && next != RequestStatus.PICKED) {
            throw new BadRequestException("Status must move from ACCEPTED to PICKED");
        }

        if (current == RequestStatus.PICKED && next != RequestStatus.DELIVERED) {
            throw new BadRequestException("Status must move from PICKED to DELIVERED");
        }
    }

    private RequestResponse toResponse(DonationRequest request) {
        return RequestResponse.builder()
                .id(request.getId())
                .donationId(request.getDonation().getId())
                .foodName(request.getDonation().getFoodName())
                .volunteerId(request.getVolunteer().getId())
                .volunteerName(request.getVolunteer().getName())
                .status(request.getStatus())
                .donationStatus(request.getDonation().getStatus())
                .build();
    }
}
