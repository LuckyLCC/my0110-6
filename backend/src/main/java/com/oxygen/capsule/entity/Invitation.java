package com.oxygen.capsule.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invitations")
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inviter_id", nullable = false)
    private Long inviterId; // 邀请人ID

    @Column(name = "invitee_id")
    private Long inviteeId; // 被邀请人ID（接受邀请后填充）

    @Column(name = "payment_order_id", nullable = false)
    private Long paymentOrderId; // 关联的支付订单ID

    @Column(name = "invite_code", unique = true, nullable = false, length = 50)
    private String inviteCode; // 邀请码

    @Column(name = "status", nullable = false, length = 20)
    private String status = "pending"; // pending-待接受, accepted-已接受, expired-已过期

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt; // 接受邀请时间

    @Column(name = "expired_at")
    private LocalDateTime expiredAt; // 过期时间（默认30天）

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiredAt == null) {
            // 默认30天后过期
            expiredAt = LocalDateTime.now().plusDays(30);
        }
    }
}

