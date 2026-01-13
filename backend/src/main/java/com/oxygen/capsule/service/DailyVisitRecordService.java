package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.DailyVisitRecord;
import java.time.LocalDate;

public interface DailyVisitRecordService {
    DailyVisitRecord incrementVisitCount(Long userId, LocalDate visitDate);
    boolean hasVisitedToday(Long userId, LocalDate visitDate);
    DailyVisitRecord findByUserIdAndVisitDate(Long userId, LocalDate visitDate);
    DailyVisitRecord createOrGetRecord(Long userId, LocalDate visitDate);
}