package com.oxygen.capsule.task;

import com.oxygen.capsule.entity.BookingOrder;
import com.oxygen.capsule.repository.BookingOrderRepository;
import com.oxygen.capsule.service.BookingOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 定时任务：检查未到店的预约订单
 * 每5分钟执行一次，检查所有待核销状态的订单
 * 如果当前时间 > 预约结束时间 + 30分钟，则更新为"未到店"状态
 * 如果是次卡，返还对应次数
 */
@Slf4j
@Component
public class NoShowUpdateTask {

    @Autowired
    private BookingOrderRepository bookingOrderRepository;

    @Autowired
    private BookingOrderService bookingOrderService;

    /**
     * 每5分钟执行一次，检查未到店的预约订单
     */
    @Scheduled(cron = "0 */5 * * * ?") // 每5分钟执行一次
    public void checkNoShowOrders() {
        log.info("========== 开始执行定时任务：检查未到店订单 ==========");
        long startTime = System.currentTimeMillis();
        
        try {
            // 获取所有待核销状态的订单
            List<BookingOrder> pendingOrders = bookingOrderRepository.findByStatus("pending");
            log.info("找到 {} 条待核销的订单", pendingOrders.size());
            
            int updatedCount = 0;
            int skippedCount = 0;
            int errorCount = 0;
            
            LocalDateTime now = LocalDateTime.now();
            
            for (BookingOrder order : pendingOrders) {
                try {
                    // 计算预约结束时间
                    LocalDateTime endTime = calculateEndTime(order.getDate(), order.getTimeSlot());
                    
                    if (endTime == null) {
                        log.warn("订单 {} 的时间段格式不正确，跳过: {}", order.getId(), order.getTimeSlot());
                        skippedCount++;
                        continue;
                    }
                    
                    // 检查是否超过结束时间30分钟
                    LocalDateTime deadline = endTime.plusMinutes(30);
                    
                    if (now.isAfter(deadline)) {
                        // 更新为未到店状态
                        bookingOrderService.markAsNoShow(order.getId());
                        updatedCount++;
                        log.info("【未到店更新】订单ID: {}, 订单号: {}, 用户ID: {}, 日期: {}, 时段: {}, 舱位: {}-{}", 
                            order.getId(), order.getOrderNo(), order.getUserId(), 
                            order.getDate(), order.getTimeSlot(), order.getCabinName(), order.getSeatName());
                        log.info("【时间信息】预约结束时间: {}, 截止时间: {}, 当前时间: {}", 
                            endTime, deadline, now);
                        log.info("----------------------------------------");
                    }
                } catch (Exception e) {
                    errorCount++;
                    log.error("处理订单 {} 失败: {}", order.getId(), e.getMessage(), e);
                }
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            log.info("========== 定时任务完成 ==========");
            log.info("总订单数: {}", pendingOrders.size());
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
     * 计算预约结束时间
     * @param date 日期，格式：YYYY-MM-DD
     * @param timeSlot 时间段，格式：HH:mm–HH:mm 或 HH:mm-HH:mm
     * @return 结束时间的LocalDateTime，如果解析失败返回null
     */
    private LocalDateTime calculateEndTime(String date, String timeSlot) {
        try {
            // 解析日期
            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            
            // 解析时间段，提取结束时间
            // 支持两种分隔符：长破折号（–）和短横线（-）
            String endTimeStr = null;
            if (timeSlot.contains("–")) {
                String[] parts = timeSlot.split("–");
                if (parts.length >= 2) {
                    endTimeStr = parts[1].trim();
                }
            } else if (timeSlot.contains("-")) {
                String[] parts = timeSlot.split("-");
                if (parts.length >= 2) {
                    endTimeStr = parts[1].trim();
                }
            }
            
            if (endTimeStr == null || endTimeStr.isEmpty()) {
                return null;
            }
            
            // 解析结束时间（HH:mm格式）
            String[] timeParts = endTimeStr.split(":");
            if (timeParts.length != 2) {
                return null;
            }
            
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);
            
            LocalTime localTime = LocalTime.of(hour, minute);
            return LocalDateTime.of(localDate, localTime);
        } catch (Exception e) {
            log.error("解析预约结束时间失败: date={}, timeSlot={}, error={}", date, timeSlot, e.getMessage());
            return null;
        }
    }
}

