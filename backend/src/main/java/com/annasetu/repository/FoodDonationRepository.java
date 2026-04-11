package com.annasetu.repository;

import com.annasetu.model.DonationStatus;
import com.annasetu.model.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByStatus(DonationStatus status);

    List<FoodDonation> findByDonorId(Long donorId);

    @Query("""
            SELECT d FROM FoodDonation d
            WHERE (:foodType IS NULL OR LOWER(d.foodName) LIKE LOWER(CONCAT('%', :foodType, '%')))
            AND (:location IS NULL OR LOWER(d.location) LIKE LOWER(CONCAT('%', :location, '%')))
            AND (:status IS NULL OR d.status = :status)
            """)
    List<FoodDonation> search(
            @Param("foodType") String foodType,
            @Param("location") String location,
            @Param("status") DonationStatus status
    );

    List<FoodDonation> findByStatusInAndExpiryTimeAfter(List<DonationStatus> statuses, LocalDateTime now);

    List<FoodDonation> findByExpiryAlertSentFalseAndExpiryTimeBetweenAndStatusIn(
            LocalDateTime from,
            LocalDateTime to,
            List<DonationStatus> statuses
    );

    long countByDonorId(Long donorId);

    long countByDonorIdAndStatusIn(Long donorId, List<DonationStatus> statuses);

    long countByStatusIn(List<DonationStatus> statuses);

    @Query("""
            SELECT d FROM FoodDonation d
            WHERE d.createdAt BETWEEN :from AND :to
            """)
    List<FoodDonation> findByCreatedAtRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
