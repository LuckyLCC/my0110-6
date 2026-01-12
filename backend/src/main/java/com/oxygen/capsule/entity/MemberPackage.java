package com.oxygen.capsule.entity;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "member_packages")
public class MemberPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "original_price")
    private Double originalPrice;

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays;

    @Column(name = "visit_count") // -1表示无限次
    private Integer visitCount;

    @Column(name = "bind_limit")
    private Integer bindLimit = 1;

    @Column(name = "badge")
    private String badge; // 新人推荐、超值等标签

    @Column(name = "per_time_price")
    private String perTimePrice; // 约 ¥xx/次

    @Column(name = "category", nullable = false) // 个人畅享、多人尊享、家庭/次卡
    private String category;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "features") // 以逗号分隔的功能特性
    private String features;
}