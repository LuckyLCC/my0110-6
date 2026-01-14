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

    @Column(name = "code", nullable = false) // 对应JSON中的code字段
    private String code;

    @Column(name = "name", nullable = false) // 对应JSON中的name字段
    private String name;

    @Column(name = "price", nullable = false) // 对应JSON中的price字段
    private Double price;

    @Column(name = "people", nullable = false) // 对应JSON中的people字段
    private Integer people;

    @Column(name = "validity_days", nullable = false) // 对应JSON中的validity_days字段
    private Integer validDays;

    @Column(name = "avg_price_per_time") // 对应JSON中的avg_price_per_time字段
    private Double avgPricePerTime;

    @Column(name = "times_per_person") // 对应JSON中的times_per_person字段（可选）
    private Integer timesPerPerson;

    @Column(name = "description") // 描述字段
    private String description;

    @Column(name = "badge") // 标签字段
    private String badge;

    @Column(name = "category") // 分类字段
    private String category;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "features") // 功能特性
    private String features;
}