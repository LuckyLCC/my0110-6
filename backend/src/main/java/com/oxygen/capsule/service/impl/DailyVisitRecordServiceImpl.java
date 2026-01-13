package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.DailyVisitRecord;
import com.oxygen.capsule.repository.DailyVisitRecordRepository;
import com.oxygen.capsule.service.DailyVisitRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DailyVisitRecordServiceImpl implements DailyVisitRecordService {

    @Autowired
    private DailyVisitRecordRepository dailyVisitRecordRepository;

    @Override
    public DailyVisitRecord incrementVisitCount(Long userId, LocalDate visitDate) {
        DailyVisitRecord record = createOrGetRecord(userId, visitDate);
        
        record.setVisitCount(record.getVisitCount() + 1);
        record.setLastVisitTime(LocalDateTime.now());
        
        return dailyVisitRecordRepository.save(record);
    }

    @Override
    public boolean hasVisitedToday(Long userId, LocalDate visitDate) {
        DailyVisitRecord record = findByUserIdAndVisitDate(userId, visitDate);
        return record != null && record.getVisitCount() > 0;
    }

    @Override
    public DailyVisitRecord findByUserIdAndVisitDate(Long userId, LocalDate visitDate) {
        return dailyVisitRecordRepository.findByUserIdAndVisitDate(userId, visitDate)
                .orElse(null);
    }

    @Override
    public DailyVisitRecord createOrGetRecord(Long userId, LocalDate visitDate) {
        DailyVisitRecord record = findByUserIdAndVisitDate(userId, visitDate);
        
        if (record == null) {
            record = new DailyVisitRecord();
            record.setUserId(userId);
            record.setVisitDate(visitDate);
            record.setVisitCount(0);
            record.setLastVisitTime(LocalDateTime.now());
            record = dailyVisitRecordRepository.save(record);
        }
        
        return record;
    }
}