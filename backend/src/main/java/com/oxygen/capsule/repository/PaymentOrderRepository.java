package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderNo(String orderNo);
    List<PaymentOrder> findByUserId(Long userId);
    List<PaymentOrder> findByUserIdAndStatus(Long userId, String status);
    List<PaymentOrder> findByStatus(String status); // 根据状态查找订单
}