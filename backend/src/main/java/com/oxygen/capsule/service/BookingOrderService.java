package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.BookingOrder;
import java.util.List;

public interface BookingOrderService {
    BookingOrder save(BookingOrder bookingOrder);
    List<BookingOrder> findByUserId(Long userId);
    List<BookingOrder> findByUserIdAndStatus(Long userId, String status);
    BookingOrder findById(Long id);
    BookingOrder findByOrderNo(String orderNo);
    BookingOrder updateStatus(Long orderId, String status);
    boolean canUserBookToday(Long userId, String date);
    List<BookingOrder> findAll();
    // 检查用户指定日期是否已经有预约订单（不管状态如何）
    boolean hasBookingForDate(Long userId, String date);
    // 统计指定购卡记录已核销的预约订单数量
    long countCompletedByPaymentOrderId(Long paymentOrderId);
    
    // 检查某个日期、时段、舱位是否已被预约（无论状态）
    boolean isCabinSeatBooked(String date, String timeSlot, String cabinName, String seatName);
    
    // 获取某个日期、时段已预约的舱位列表
    List<String> getBookedCabinSeats(String date, String timeSlot);
    
    // 更新订单状态为未到店，如果是次卡则返还次数
    void markAsNoShow(Long orderId);
}