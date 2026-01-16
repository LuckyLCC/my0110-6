package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.BookingOrder;
import com.oxygen.capsule.repository.BookingOrderRepository;
import com.oxygen.capsule.service.BookingOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class BookingOrderServiceImpl implements BookingOrderService {

    @Autowired
    private BookingOrderRepository bookingOrderRepository;

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
        // 检查用户指定日期是否已经有预约订单（不管状态如何）
        // 如果已经有预约订单，则不能再次预约
        return !hasBookingForDate(userId, date);
    }

    @Override
    public boolean hasBookingForDate(Long userId, String date) {
        // 查找用户指定日期且状态不是已取消的预约订单
        // 已取消的订单不影响用户再次预约
        List<BookingOrder> orders = bookingOrderRepository.findByUserIdAndDateAndStatusNot(userId, date, "cancelled");
        // 如果用户在该日期已经有非取消状态的预约订单，返回true
        return orders != null && !orders.isEmpty();
    }

    @Override
    public long countCompletedByPaymentOrderId(Long paymentOrderId) {
        if (paymentOrderId == null) {
            return 0;
        }
        // 统计已核销（completed）的预约订单数量
        // 注意：这里只统计 paymentOrderId 匹配的订单，确保每张次卡独立计算剩余次数
        // 不会出现第二张卡的次数减去第一张卡订单的情况
        return bookingOrderRepository.countByPaymentOrderIdAndStatus(paymentOrderId, "completed");
    }

    @Override
    public boolean isCabinSeatBooked(String date, String timeSlot, String cabinName, String seatName) {
        // 查找该日期、时段、舱位且状态不是已取消和未到店的预约订单
        // 已取消和未到店的订单不影响舱位的可用性
        List<BookingOrder> orders = bookingOrderRepository.findByDateAndTimeSlotAndCabinNameAndSeatName(date, timeSlot, cabinName, seatName);
        if (orders != null) {
            // 过滤掉已取消和未到店的订单
            orders = orders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()) && !"no_show".equals(o.getStatus()))
                .collect(java.util.stream.Collectors.toList());
        }
        // 如果找到任何有效状态的订单，说明该舱位已被预约
        return orders != null && !orders.isEmpty();
    }

    @Override
    public List<String> getBookedCabinSeats(String date, String timeSlot) {
        // 获取该日期和时段的所有预约订单，但排除已取消和未到店的订单
        // 已取消和未到店的订单不影响舱位的可用性
        List<BookingOrder> allOrders = bookingOrderRepository.findByDateAndTimeSlot(date, timeSlot);
        // 过滤掉已取消和未到店的订单
        List<BookingOrder> orders = allOrders != null ? allOrders.stream()
            .filter(o -> !"cancelled".equals(o.getStatus()) && !"no_show".equals(o.getStatus()))
            .collect(java.util.stream.Collectors.toList()) : null;
        
        // 构建已预约的舱位列表，格式：cabinName-seatName
        List<String> bookedSeats = new java.util.ArrayList<>();
        if (orders != null) {
            for (BookingOrder order : orders) {
                String seatKey = order.getCabinName() + "-" + order.getSeatName();
                if (!bookedSeats.contains(seatKey)) {
                    bookedSeats.add(seatKey);
                }
            }
        }
        return bookedSeats;
    }

    @Override
    public void markAsNoShow(Long orderId) {
        BookingOrder order = findById(orderId);
        if (order != null && "pending".equals(order.getStatus())) {
            order.setStatus("no_show");
            bookingOrderRepository.save(order);
            
            // 注意：未到店不需要返还次数，因为次数只有在核销后才会扣减
            // 未到店的订单状态是"待核销"，说明还没有核销，次数本来就没有被扣减
            log.info("未到店订单已更新状态，预约订单ID: {}, 订单号: {}", orderId, order.getOrderNo());
        }
    }
}