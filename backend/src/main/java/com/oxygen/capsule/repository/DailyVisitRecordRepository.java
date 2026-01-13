package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.DailyVisitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyVisitRecordRepository extends JpaRepository<DailyVisitRecord, Long> {
    Optional<DailyVisitRecord> findByUserIdAndVisitDate(Long userId, LocalDate visitDate);
}