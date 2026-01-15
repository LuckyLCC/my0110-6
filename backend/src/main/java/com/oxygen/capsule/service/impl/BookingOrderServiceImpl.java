package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.BookingOrder;
import com.oxygen.capsule.repository.BookingOrderRepository;
import com.oxygen.capsule.service.BookingOrderService;
import com.oxygen.capsule.service.DailyVisitRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingOrderServiceImpl implements BookingOrderService {

    @Autowired
    private BookingOrderRepository bookingOrderRepository;

    @Autowired
    private DailyVisitRecordService dailyVisitRecordService;

    @Override
    public BookingOrder save(BookingOrder bookingOrder) {
        return bookingOrderRepository.save(bookingOrder);
    }

    @Override
    public List<BookingOrder> findByUserId(Long userId) {
        return bookingOrderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<BookingOrder> findByUserIdAndStatus(Long userId, String status) {
        return bookingOrderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    @Override
    public BookingOrder findById(Long id) {
        return bookingOrderRepository.findById(id).orElse(null);
    }

    @Override
    public BookingOrder findByOrderNo(String orderNo) {
        return bookingOrderRepository.findByOrderNo(orderNo);
    }

    @Override
    public BookingOrder updateStatus(Long orderId, String status) {
        BookingOrder order = findById(orderId);
        if (order != null) {
            order.setStatus(status);
            return bookingOrderRepository.save(order);
        }
        return null;
    }

    @Override
    public List<BookingOrder> findAll() {
        return bookingOrderRepository.findAll();
    }

    @Override
    public boolean canUserBookToday(Long userId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        return !dailyVisitRecordService.hasVisitedToday(userId, localDate);
    }
}