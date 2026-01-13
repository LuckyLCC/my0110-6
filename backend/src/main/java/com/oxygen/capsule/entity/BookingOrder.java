package com.oxygen.capsule.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "booking_orders")
public class BookingOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", unique = true, nullable = false)
    private String orderNo;

    @Column(name = "user_id", nullable = false) // 使用ID关联，不使用外键约束
    private Long userId;

    @Column(name = "date", nullable = false) // 预约日期
    private String date; // 格式：YYYY-MM-DD

    @Column(name = "time_slot", nullable = false) // 时间段
    private String timeSlot; // 格式：HH:mm-HH:mm

    @Column(name = "cabin_name", nullable = false) // 舱室名称
    private String cabinName; // 如：1号舱

    @Column(name = "seat_name", nullable = false) // 座位名称
    private String seatName; // 如：A座

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "original_price")
    private Double originalPrice;

    @Column(name = "status", nullable = false) // 待核销、已完成
    private String status = "pending"; // pending, completed

    @Column(name = "payment_status")
    private String paymentStatus = "unpaid"; // unpaid, paid

    @Column(name = "payment_method")
    private String paymentMethod; // wechat_pay, member_card, etc.

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "consume_time")
    private LocalDateTime consumeTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderNo == null || orderNo.isEmpty()) {
            orderNo = generateOrderNo();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private String generateOrderNo() {
        // 生成订单号：时间戳+随机数
        return "BK" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }
}