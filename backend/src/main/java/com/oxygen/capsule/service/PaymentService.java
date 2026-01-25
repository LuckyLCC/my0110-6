package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.PaymentOrder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface PaymentService {
    PaymentOrder createPackageOrder(Long userId, Long packageId, Double price, LocalDateTime cardStartDate, Long staffId, String staffName);
    Map<String, String> getWechatPayParams(Long orderId, Long userId);
    PaymentOrder findById(Long id);
    PaymentOrder updateOrderStatus(Long orderId, String status);
    PaymentOrder findByOrderNo(String orderNo);
    void handlePaymentNotify(String notifyData);
    List<PaymentOrder> findByUserId(Long userId);
    void updateCardStatus(Long paymentOrderId); // 更新卡状态
    
    // 返还次卡次数（用于未到店订单）
    void refundTimesCard(Long paymentOrderId);
}