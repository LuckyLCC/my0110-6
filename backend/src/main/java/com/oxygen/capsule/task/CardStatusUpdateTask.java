package com.oxygen.capsule.task;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.enums.PaymentOrdersCardStatusEnum;
import com.oxygen.capsule.entity.enums.PaymentOrdersStatusEnum;
import com.oxygen.capsule.repository.PaymentOrderRepository;
import com.oxygen.capsule.service.MemberPackageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 定时任务：定期更新购卡记录的状态
 * 每天凌晨2点执行，更新所有已支付订单的卡状态
 */
@Slf4j
@Component
public class CardStatusUpdateTask {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private MemberPackageService memberPackageService;


    /**
     * 每天凌晨2点执行，更新所有已支付订单的卡状态
     * 
     * 更新逻辑：
     * 1. 获取所有已支付的订单
     * 2. 对每个订单重新计算状态：
     *    - 次卡：检查剩余次数，如果为0则更新为"已完成"
     *    - 所有卡种：检查日期，如果过期则更新为"已完成"
     *    - 如果未到开始日期，更新为"未生效"
     *    - 如果在有效期内，更新为"生效中"
     * 3. 只更新状态发生变化的订单，减少数据库操作
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void updateCardStatuses() {
        log.info("========== 开始执行定时任务：更新购卡记录状态 ==========");
        long startTime = System.currentTimeMillis();
        
        try {
            // 获取所有已支付的订单
            List<PaymentOrder> paidOrders = paymentOrderRepository.findByStatus(PaymentOrdersStatusEnum.PAID);
            log.info("找到 {} 条已支付的订单", paidOrders.size());
            
            int updatedCount = 0;
            int skippedCount = 0;
            int errorCount = 0;
            
            for (PaymentOrder order : paidOrders) {
                try {
                    // 获取套餐信息
                    MemberPackage pkg = memberPackageService.findById(order.getPackageId());
                    if (pkg == null) {
                        log.warn("订单 {} 的套餐不存在，跳过", order.getId());
                        skippedCount++;
                        continue;
                    }
                    
                    // 计算新的状态
                    PaymentOrdersCardStatusEnum newStatus = calculateCardStatus(order, pkg);
                    PaymentOrdersCardStatusEnum oldStatus = order.getCardStatus();
                    
                    // 只有状态发生变化时才更新
                    if (newStatus != null && newStatus != oldStatus) {
                        // 保存更新前的数据（在更新前保存）
                        PaymentOrdersCardStatusEnum oldStatusBefore = order.getCardStatus();
                        Integer oldRemainingTimesBefore = order.getRemainingTimes();
                        String oldCardStartDateBefore = order.getCardStartDate() != null ? 
                            order.getCardStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : null;
                        String oldCardEndDateBefore = order.getCardEndDate() != null ? 
                            order.getCardEndDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : null;
                        
                        // 更新订单状态
                        order.setCardStatus(newStatus);
                        PaymentOrder savedOrder = paymentOrderRepository.save(order);
                        
                        // 保存更新后的数据
                        PaymentOrdersCardStatusEnum newStatusAfter = savedOrder.getCardStatus();
                        Integer newRemainingTimesAfter = savedOrder.getRemainingTimes();
                        String newCardStartDateAfter = savedOrder.getCardStartDate() != null ? 
                            savedOrder.getCardStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : null;
                        String newCardEndDateAfter = savedOrder.getCardEndDate() != null ? 
                            savedOrder.getCardEndDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : null;
                        
                        // 生成更新原因
                        String updateReason = generateUpdateReason(oldStatusBefore, newStatusAfter, savedOrder, pkg);
                        
                        // 记录详细日志到文件
                        log.info("【状态更新】订单ID: {}, 订单号: {}, 用户ID: {}, 套餐: {} ({})", 
                            order.getId(), order.getOrderNo(), order.getUserId(), 
                            order.getPackageName(), pkg.getCategory());
                        log.info("【更新前】状态: {}, 剩余次数: {}, 开始日期: {}, 到期日期: {}", 
                            oldStatusBefore, oldRemainingTimesBefore, oldCardStartDateBefore, oldCardEndDateBefore);
                        log.info("【更新后】状态: {}, 剩余次数: {}, 开始日期: {}, 到期日期: {}", 
                            newStatusAfter, newRemainingTimesAfter, newCardStartDateAfter, newCardEndDateAfter);
                        log.info("【更新原因】{}", updateReason);
                        log.info("----------------------------------------");
                        
                        updatedCount++;
                    }
                } catch (Exception e) {
                    errorCount++;
                    log.error("更新订单 {} 的状态失败: {}", order.getId(), e.getMessage(), e);
                }
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            log.info("========== 定时任务完成 ==========");
            log.info("总订单数: {}", paidOrders.size());
            log.info("更新数量: {}", updatedCount);
            log.info("跳过数量: {}", skippedCount);
            log.info("错误数量: {}", errorCount);
            log.info("执行耗时: {} 毫秒", duration);
            log.info("=====================================");
        } catch (Exception e) {
            log.error("执行定时任务失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 计算卡的状态：未生效、生效中、已完成
     * 简化逻辑：
     * - 次卡：检查 remaining_times <= 0 或过期 → "已完成"
     * - 其他卡种：检查过期 → "已完成"
     */
    private PaymentOrdersCardStatusEnum calculateCardStatus(PaymentOrder order, MemberPackage pkg) {
        // 如果订单未支付，状态为未生效
        if (order.getStatus() != PaymentOrdersStatusEnum.PAID) {
            return PaymentOrdersCardStatusEnum.INACTIVE;
        }
        
        LocalDate now = LocalDate.now();
        
        // 检查是否是次卡
        boolean isTimesCard = "家庭/次卡".equals(pkg.getCategory());
        
        // 对于次卡，检查剩余次数（使用数据库中的 remaining_times 字段）
        if (isTimesCard) {
            // 如果剩余次数 <= 0，状态为已完成
            if (order.getRemainingTimes() != null && order.getRemainingTimes() <= 0) {
                return PaymentOrdersCardStatusEnum.COMPLETED;
            }
        }
        
        // 检查日期
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        if (order.getCardStartDate() != null) {
            startDate = order.getCardStartDate().toLocalDate();
        }
        if (order.getCardEndDate() != null) {
            endDate = order.getCardEndDate().toLocalDate();
        }
        
        // 如果当前时间 < 卡开始日期，则为未生效
        if (startDate != null && now.isBefore(startDate)) {
            return PaymentOrdersCardStatusEnum.INACTIVE;
        }
        
        // 如果当前时间 > 卡到期日期，则为已完成
        if (endDate != null && now.isAfter(endDate)) {
            return PaymentOrdersCardStatusEnum.COMPLETED;
        }
        
        // 如果当前时间在有效期内，则为生效中
        if ((startDate == null || !now.isBefore(startDate)) && 
            (endDate == null || !now.isAfter(endDate))) {
            return PaymentOrdersCardStatusEnum.ACTIVE;
        }
        
        // 默认返回已完成
        return PaymentOrdersCardStatusEnum.COMPLETED;
    }
    
    /**
     * 生成更新原因说明
     */
    private String generateUpdateReason(PaymentOrdersCardStatusEnum oldStatus, PaymentOrdersCardStatusEnum newStatus,
                                        PaymentOrder order, MemberPackage pkg) {
        StringBuilder reason = new StringBuilder();
        
        if (oldStatus == PaymentOrdersCardStatusEnum.INACTIVE && newStatus == PaymentOrdersCardStatusEnum.ACTIVE) {
            reason.append("卡已到开始日期，状态从未生效变为生效中");
        } else if (oldStatus == PaymentOrdersCardStatusEnum.ACTIVE && newStatus == PaymentOrdersCardStatusEnum.COMPLETED) {
            boolean isTimesCard = "家庭/次卡".equals(pkg.getCategory());
            if (isTimesCard && order.getRemainingTimes() != null && order.getRemainingTimes() <= 0) {
                reason.append("次卡剩余次数已用完");
            } else {
                reason.append("卡已过期");
            }
        } else if (oldStatus == PaymentOrdersCardStatusEnum.INACTIVE && newStatus == PaymentOrdersCardStatusEnum.COMPLETED) {
            reason.append("卡已过期（未到开始日期但已过到期日期）");
        } else {
            reason.append("定时任务自动更新：").append(oldStatus).append(" -> ").append(newStatus);
        }
        
        // 添加详细信息
        if (order.getCardStartDate() != null && order.getCardEndDate() != null) {
            reason.append("（开始日期：").append(order.getCardStartDate().toLocalDate())
                  .append("，到期日期：").append(order.getCardEndDate().toLocalDate()).append("）");
        }
        
        if ("家庭/次卡".equals(pkg.getCategory()) && order.getRemainingTimes() != null) {
            reason.append("（剩余次数：").append(order.getRemainingTimes()).append("）");
        }
        
        return reason.toString();
    }
}

