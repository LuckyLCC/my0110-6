package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.BookingOrder;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.entity.enums.PaymentOrdersCardStatusEnum;
import com.oxygen.capsule.entity.enums.BookingOrdersStatusEnum;
import com.oxygen.capsule.entity.enums.PaymentOrdersStatusEnum;
import com.oxygen.capsule.entity.enums.BookingOrdersPaymentStatusEnum;
import com.oxygen.capsule.service.BookingOrderService;
import com.oxygen.capsule.service.MemberPackageService;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingOrderService bookingOrderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.oxygen.capsule.service.DailyVisitRecordService dailyVisitRecordService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MemberPackageService memberPackageService;
    
    @Autowired
    private com.oxygen.capsule.util.WxPayUtil wxPayUtil;

    // 获取某个日期和时段已预约的舱位列表
    @GetMapping("/booked-seats")
    public Result<List<String>> getBookedSeats(@RequestParam String date, @RequestParam String timeSlot) {
        try {
            List<String> bookedSeats = bookingOrderService.getBookedCabinSeats(date, timeSlot);
            return Result.success(bookedSeats);
        } catch (Exception e) {
            log.error("获取已预约舱位列表失败: {}", e.getMessage(), e);
            return Result.error("获取已预约舱位列表失败: " + e.getMessage());
        }
    }

    // 创建预约订单
    @PostMapping("/create")
    public Result<BookingOrder> createBooking(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, Object> params) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        // 从请求体中获取参数
        String date = (String) params.get("date");
        String timeSlot = (String) params.get("timeSlot");
        String cabinName = (String) params.get("cabinName");
        String seatName = (String) params.get("seatName");
        
        // 处理价格参数，支持 Integer 和 Double
        Double price = null;
        Object priceObj = params.get("price");
        if (priceObj != null) {
            if (priceObj instanceof Integer) {
                price = ((Integer) priceObj).doubleValue();
            } else if (priceObj instanceof Double) {
                price = (Double) priceObj;
            } else {
                price = Double.valueOf(priceObj.toString());
            }
        }
        
        Double originalPrice = null;
        Object originalPriceObj = params.get("originalPrice");
        if (originalPriceObj != null) {
            if (originalPriceObj instanceof Integer) {
                originalPrice = ((Integer) originalPriceObj).doubleValue();
            } else if (originalPriceObj instanceof Double) {
                originalPrice = (Double) originalPriceObj;
            } else {
                originalPrice = Double.valueOf(originalPriceObj.toString());
            }
        }

        // 检查用户指定日期是否已经有预约订单（每人每天只能预约一次）
        if (bookingOrderService.hasBookingForDate(user.getId(), date)) {
            return Result.error("您在该日期已经预约过了，每人每天只能预约一次");
        }
        
        // 检查该日期、时段、舱位是否已被预约（无论状态，包括已取消）
        if (bookingOrderService.isCabinSeatBooked(date, timeSlot, cabinName, seatName)) {
            return Result.error("该时段该舱位已被预约，请选择其他舱位");
        }
        
        BookingOrder order = new BookingOrder();
        order.setUserId(user.getId());
        order.setDate(date);
        order.setTimeSlot(timeSlot);
        order.setCabinName(cabinName);
        order.setSeatName(seatName);
        order.setPrice(price);
        order.setOriginalPrice(originalPrice);
        order.setStatus(BookingOrdersStatusEnum.PENDING); // 默认为待核销
        order.setPaymentStatus(BookingOrdersPaymentStatusEnum.UNPAID); // 默认为未支付

        // 如果是会员预约（price为0），需要找到生效中的卡
        // 如果是次卡，必须确保有剩余次数才能预约
        // 如果是非次卡（如月卡），直接允许预约
        // 注意：只有 cardStatus 为 "生效中" 的卡才允许预约
        if (price != null && price == 0) {
            log.info("========== 开始检查会员预约资格 ==========");
            log.info("用户ID: {}, 预约日期: {}", user.getId(), date);
            boolean foundActiveCard = false;
            try {
                // 查找用户已支付的购卡记录
                List<PaymentOrder> allOrders = paymentService.findByUserId(user.getId());
                List<PaymentOrder> paidOrders = allOrders.stream()
                    .filter(po -> po.getStatus() == PaymentOrdersStatusEnum.PAID)
                    .collect(java.util.stream.Collectors.toList());
                
                // 找到生效中的卡（必须使用 cardStatus 判断，确保状态准确）
                for (PaymentOrder paymentOrder : paidOrders) {
                    // 检查卡是否生效中（必须使用 cardStatus，只有"生效中"才允许预约）
                    // 如果 cardStatus 为 null、"未生效"或"已完成"，都不允许预约
                    PaymentOrdersCardStatusEnum cardStatus = paymentOrder.getCardStatus();
                    boolean isActive = false;
                    
                    // 添加调试日志
                    log.debug("检查订单 {} (套餐: {}), cardStatus: {}", 
                        paymentOrder.getId(), paymentOrder.getPackageName(), cardStatus);
                    
                    if (cardStatus != null) {
                        // 只有"生效中"状态才允许预约
                        isActive = cardStatus == PaymentOrdersCardStatusEnum.ACTIVE;
                        log.debug("订单 {} 状态检查结果: {}", 
                            paymentOrder.getId(), (isActive ? "生效中，允许预约" : cardStatus + "，不允许预约"));
                    } else {
                        // 如果 cardStatus 为 null，说明状态未正确设置，不允许预约
                        log.warn("警告：订单 {} 的 cardStatus 为 null，不允许预约", paymentOrder.getId());
                        isActive = false;
                    }
                    
                    if (isActive) {
                        // 获取套餐信息
                        com.oxygen.capsule.entity.MemberPackage pkg = 
                            memberPackageService.findById(paymentOrder.getPackageId());
                        if (pkg != null) {
                            // 如果是家庭次卡，需要检查剩余次数
                            if ("家庭/次卡".equals(pkg.getCategory())) {
                                // 检查剩余次数是否足够（使用数据库中的 remaining_times 字段）
                                if (paymentOrder.getRemainingTimes() != null && paymentOrder.getRemainingTimes() > 0) {
                                    // 关联购卡记录，确保预约订单与购卡记录一一对应
                                    // 这样核销时只会减少该购卡记录的剩余次数
                                    order.setPaymentOrderId(paymentOrder.getId());
                                    foundActiveCard = true;
                                    break; // 找到第一张有剩余次数的次卡就使用
                                }
                                // 次卡剩余次数为0，继续查找其他卡
                            } else {
                                // 非次卡（如月卡、年卡等），直接允许预约，不需要检查剩余次数
                                // 不需要关联 paymentOrderId（因为非次卡不消耗次数）
                                foundActiveCard = true;
                                break; // 找到第一张生效中的非次卡就使用
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("查找生效中的卡失败: {}", e.getMessage(), e);
            }
            
            // 如果是会员预约但没有找到生效中的卡，返回错误提示
            if (!foundActiveCard) {
                log.warn("========== 会员预约检查失败：未找到生效中的卡 ==========");
                return Result.error("您没有生效中的会员卡，请先购买会员卡");
            }
            log.info("========== 会员预约检查通过 ==========");
        } else {
            // 非会员预约（price > 0），不需要检查会员卡状态
            log.info("非会员预约，价格: {}，不需要检查会员卡状态", price);
        }

        BookingOrder savedOrder = bookingOrderService.save(order);
        return Result.success("预约成功", savedOrder);
    }

    // 获取预约订单的微信支付参数
    @PostMapping("/wechat-pay/{orderId}")
    public Result<Map<String, String>> getBookingWechatPayParams(
            @RequestHeader("Authorization") String token,
                                     @PathVariable Long orderId) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        if (order.getPaymentStatus() == BookingOrdersPaymentStatusEnum.PAID) {
            return Result.error("订单已支付");
        }

        if (order.getPrice() == null || order.getPrice() <= 0) {
            return Result.error("订单金额异常");
        }

        try {
            // 获取用户openid
            if (user.getOpenid() == null) {
                return Result.error("用户信息异常，无法获取支付信息");
            }

            // 将价格转换为分（微信支付以分为单位）
            int amount = (int) Math.round(order.getPrice() * 100);

            // 调用微信支付工具类生成支付参数
            Map<String, String> payParams = wxPayUtil.generatePayParams(
                order.getId().toString(),
                order.getOrderNo(),
                amount,
                user.getOpenid()
            );

            return Result.success("获取支付参数成功", payParams);
        } catch (Exception e) {
            log.error("获取预约订单微信支付参数失败: {}", e.getMessage(), e);
            return Result.error("获取支付参数失败: " + e.getMessage());
        }
    }

    // Mock支付成功接口（仅用于开发测试）
    @PostMapping("/mock-success/{orderId}")
    public Result<String> mockBookingPaymentSuccess(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        if (order.getPaymentStatus() == BookingOrdersPaymentStatusEnum.PAID) {
            return Result.error("订单已支付");
        }

        try {
        // 更新订单支付状态
        order.setPaymentStatus(BookingOrdersPaymentStatusEnum.PAID);
        order.setPaymentTime(LocalDateTime.now());
            order.setPaymentMethod("wechat_pay");
        order = bookingOrderService.save(order);

            return Result.success("Mock支付成功，订单状态已更新", "success");
        } catch (Exception e) {
            log.error("Mock预约订单支付成功处理失败: {}", e.getMessage(), e);
            return Result.error("Mock支付成功处理失败: " + e.getMessage());
        }
    }

    // 支付预约订单（已废弃，改为使用微信支付）
    @PostMapping("/pay/{orderId}")
    @Deprecated
    public Result<String> payBooking(@RequestHeader("Authorization") String token,
                                     @PathVariable Long orderId) {
        return Result.error("请使用微信支付接口");
    }

    // 获取用户的所有预约订单
    @GetMapping("/orders")
    public Result<List<BookingOrder>> getUserOrders(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        List<BookingOrder> orders = bookingOrderService.findByUserId(user.getId());
        return Result.success(orders);
    }

    // 根据状态获取用户预约订单
    @GetMapping("/orders/status/{status}")
    public Result<List<BookingOrder>> getUserOrdersByStatus(@RequestHeader("Authorization") String token,
                                                            @PathVariable String status) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrdersStatusEnum bookingStatus;
        try {
            bookingStatus = BookingOrdersStatusEnum.fromDb(status);
        } catch (Exception e) {
            return Result.error("不支持的订单状态: " + status);
        }
        List<BookingOrder> orders = bookingOrderService.findByUserIdAndStatus(user.getId(), bookingStatus);
        return Result.success(orders);
    }

    // 更新订单状态（例如，标记为已完成）
    @PutMapping("/order/{orderId}/status")
    public Result<BookingOrder> updateOrderStatus(@RequestHeader("Authorization") String token,
                                                  @PathVariable Long orderId,
                                                  @RequestParam String status) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        BookingOrdersStatusEnum bookingStatus;
        try {
            bookingStatus = BookingOrdersStatusEnum.fromDb(status);
        } catch (Exception e) {
            return Result.error("不支持的订单状态: " + status);
        }
        order = bookingOrderService.updateStatus(orderId, bookingStatus);
        
        // 如果状态变为已完成，增加用户当日访问次数
        if (bookingStatus == BookingOrdersStatusEnum.COMPLETED) {
            dailyVisitRecordService.incrementVisitCount(user.getId(), java.time.LocalDate.parse(order.getDate()));
        }
        
        return Result.success("状态更新成功", order);
    }

    // 检查用户是否可以预订当天
    @GetMapping("/can-book-today")
    public Result<Boolean> canBookToday(@RequestHeader("Authorization") String token,
                                       @RequestParam String date) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }
        
        boolean canBook = bookingOrderService.canUserBookToday(user.getId(), date);
        return Result.success(canBook);
    }
    
    // 获取订单详情
    @GetMapping("/order/{orderId}")
    public Result<BookingOrder> getOrderDetail(@RequestHeader("Authorization") String token,
                                               @PathVariable Long orderId) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        return Result.success(order);
    }

    // 取消预约订单
    @PostMapping("/cancel/{orderId}")
    public Result<BookingOrder> cancelBooking(@RequestHeader("Authorization") String token,
                                             @PathVariable Long orderId) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        // 检查订单状态，只有待核销的订单才能取消
        if (order.getStatus() != BookingOrdersStatusEnum.PENDING) {
            if (order.getStatus() == BookingOrdersStatusEnum.COMPLETED) {
                return Result.error("订单已完成，无法取消");
            }
            if (order.getStatus() == BookingOrdersStatusEnum.CANCELLED) {
                return Result.error("订单已取消");
            }
            return Result.error("订单状态异常，无法取消");
        }

        // 检查订单日期，只能取消今天或未来的订单
        java.time.LocalDate orderDate = java.time.LocalDate.parse(order.getDate());
        java.time.LocalDate today = java.time.LocalDate.now();
        
        if (orderDate.isBefore(today)) {
            return Result.error("已过期的订单无法取消");
        }

        // 更新订单状态为已取消
        // 注意：取消预约不需要返还次数，因为次数只有在核销后才会扣减
        order = bookingOrderService.updateStatus(orderId, BookingOrdersStatusEnum.CANCELLED);
        
        log.info("取消预约成功，预约订单ID: {}, 订单号: {}", orderId, order != null ? order.getOrderNo() : "未知");
        
        return Result.success("取消预约成功", order);
    }

    // 通过订单号核销（商家端使用）
    @PostMapping("/verify/{orderNo}")
    public Result<BookingOrder> verifyOrderByOrderNo(
            @RequestHeader("Authorization") String token,
            @PathVariable String orderNo) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        // 验证商家权限（这里可以根据实际需求添加商家角色验证）
        // Long staffId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        try {
            // 根据订单号查找订单
            BookingOrder order = bookingOrderService.findByOrderNo(orderNo);
            
            if (order == null) {
                return Result.error("订单不存在");
            }
            
            // 检查订单状态
            if (order.getStatus() == BookingOrdersStatusEnum.COMPLETED) {
                return Result.error("订单已核销");
            }
            
            if (order.getStatus() == BookingOrdersStatusEnum.CANCELLED) {
                return Result.error("订单已取消，无法核销");
            }
            
            if (order.getStatus() != BookingOrdersStatusEnum.PENDING) {
                return Result.error("订单状态异常，无法核销");
            }
            
            // 检查订单日期是否为今天或之前
            java.time.LocalDate orderDate = java.time.LocalDate.parse(order.getDate());
            java.time.LocalDate today = java.time.LocalDate.now();
            
            if (orderDate.isAfter(today)) {
                return Result.error("预约日期未到，无法核销");
            }
            
            // 更新订单状态为已完成
            order = bookingOrderService.updateStatus(order.getId(), BookingOrdersStatusEnum.COMPLETED);
            
            // 记录核销时间
            order.setConsumeTime(java.time.LocalDateTime.now());
            order = bookingOrderService.save(order);
            
            // 增加用户当日访问次数
            dailyVisitRecordService.incrementVisitCount(order.getUserId(), orderDate);
            
            // 如果该预约订单关联了购卡记录（次卡），更新购卡记录的状态
            if (order.getPaymentOrderId() != null) {
                try {
                    // 更新购卡记录的状态（如果剩余次数为0，状态会变为"已完成"）
                    paymentService.updateCardStatus(order.getPaymentOrderId());
                } catch (Exception e) {
                    log.error("更新购卡记录状态失败，预约订单ID: {}, 购卡订单ID: {}, 错误: {}", 
                        order.getId(), order.getPaymentOrderId(), e.getMessage(), e);
                    // 不影响核销结果，只记录错误
                }
            } else {
                log.info("核销成功，预约订单ID: {}, 订单号: {}", order.getId(), order.getOrderNo());
            }
            
            return Result.success("核销成功", order);
            
        } catch (Exception e) {
            log.error("核销失败: {}", e.getMessage(), e);
            return Result.error("核销失败: " + e.getMessage());
        }
    }
}