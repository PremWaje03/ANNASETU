package com.annasetu.repository;

import com.annasetu.model.DonationRequest;
import com.annasetu.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {

    Optional<DonationRequest> findByDonationId(Long donationId);

    List<DonationRequest> findByVolunteerId(Long volunteerId);

    long countByVolunteerId(Long volunteerId);

    long countByVolunteerIdAndStatus(Long volunteerId, RequestStatus status);

    long countByStatus(RequestStatus status);
}
