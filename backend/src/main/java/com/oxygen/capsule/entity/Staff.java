package com.oxygen.capsule.entity;

import com.oxygen.capsule.entity.converter.StaffStatusConverter;
import com.oxygen.capsule.entity.enums.StaffsStatusEnum;
import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "staffs")
@EntityListeners(EnglishUppercaseEntityListener.class)
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false)
    private String username; // 商家用户名

    @Column(name = "password", nullable = false)
    private String password; // 商家密码（加密后的密码）

    @Column(name = "name")
    private String name; // 商家名称/姓名

    @Column(name = "phone")
    private String phone; // 联系电话

    @Column(name = "status")
    @Convert(converter = StaffStatusConverter.class)
    private StaffsStatusEnum status = StaffsStatusEnum.ACTIVE;

    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

