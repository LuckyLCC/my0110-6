package com.oxygen.capsule.entity;

import com.oxygen.capsule.entity.converter.UserRoleConverter;
import com.oxygen.capsule.entity.enums.UsersRoleEnum;
import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
@EntityListeners(EnglishUppercaseEntityListener.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "openid", unique = true, nullable = false)
    private String openid;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "member_level")
    private Integer memberLevel = 0; // 0-普通用户, 1-会员

    @Column(name = "member_expire_time")
    private LocalDateTime memberExpireTime;

    @Column(name = "total_visits")
    private Integer totalVisits = 0;

    @Column(name = "remaining_visits")
    private Integer remainingVisits = 0;

    @Column(name = "points")
    private Integer points = 0;

    @Column(name = "role")
    @Convert(converter = UserRoleConverter.class)
    private UsersRoleEnum role = UsersRoleEnum.USER; // user-普通用户, staff-商家

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;

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