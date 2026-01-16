package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.BookingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingOrderRepository extends JpaRepository<BookingOrder, Long> {
    List<BookingOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<BookingOrder> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    BookingOrder findByOrderNo(String orderNo);
    // 查找用户指定日期的预约订单（用于检查用户是否已经预约过该日期）
    List<BookingOrder> findByUserIdAndDate(Long userId, String date);
    // 查找用户指定日期且状态不是已取消的预约订单（用于检查用户是否可以再次预约）
    List<BookingOrder> findByUserIdAndDateAndStatusNot(Long userId, String date, String status);
    // 统计指定购卡记录已核销的预约订单数量
    long countByPaymentOrderIdAndStatus(Long paymentOrderId, String status);
    
    // 查找某个日期、时段、舱位是否已被预约（无论状态，包括已取消）
    List<BookingOrder> findByDateAndTimeSlotAndCabinNameAndSeatName(String date, String timeSlot, String cabinName, String seatName);
    
    // 查找某个日期、时段的所有预约订单（用于获取已预约的舱位列表）
    List<BookingOrder> findByDateAndTimeSlot(String date, String timeSlot);
    
    // 查找某个日期、时段、舱位且状态不是已取消的预约订单（用于检查舱位是否已被预约）
    List<BookingOrder> findByDateAndTimeSlotAndCabinNameAndSeatNameAndStatusNot(String date, String timeSlot, String cabinName, String seatName, String status);
    
    // 查找某个日期、时段且状态不是已取消的所有预约订单（用于获取已预约的舱位列表）
    List<BookingOrder> findByDateAndTimeSlotAndStatusNot(String date, String timeSlot, String status);
    
    // 查找所有待核销状态的预约订单（用于定时任务检查未到店）
    List<BookingOrder> findByStatus(String status);
}