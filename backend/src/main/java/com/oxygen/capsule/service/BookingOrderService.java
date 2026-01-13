package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.BookingOrder;
import java.util.List;

public interface BookingOrderService {
    BookingOrder save(BookingOrder bookingOrder);
    List<BookingOrder> findByUserId(Long userId);
    List<BookingOrder> findByUserIdAndStatus(Long userId, String status);
    BookingOrder findById(Long id);
    BookingOrder updateStatus(Long orderId, String status);
    boolean canUserBookToday(Long userId, String date);
    List<BookingOrder> findAll();
}