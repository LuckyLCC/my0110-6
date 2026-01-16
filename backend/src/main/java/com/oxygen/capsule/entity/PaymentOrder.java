package com.oxygen.capsule.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_orders")
public class PaymentOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", unique = true, nullable = false)
    private String orderNo;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "package_id", nullable = false)
    private Long packageId;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "status", nullable = false)
    private String status = "unpaid"; // unpaid, paid, cancelled

    @Column(name = "payment_method")
    private String paymentMethod; // wechat_pay, alipay, etc.

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "card_start_date")
    private LocalDateTime cardStartDate; // 卡开始日期

    @Column(name = "card_end_date")
    private LocalDateTime cardEndDate; // 卡到期日期

    @Column(name = "transaction_type")
    private String transactionType = "NEW"; // 交易类型: NEW-新开卡, RENEW-续费

    @Column(name = "card_status")
    private String cardStatus = "未生效"; // 卡状态: 未生效, 生效中, 已完成

    @Column(name = "remaining_times")
    private Integer remainingTimes; // 剩余次数（仅次卡有效，其他卡种为NULL）

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
        // 生成订单号：PAY + 时间戳 + 随机数
        return "PAY" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }
}