package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.BookingOrder;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.service.BookingOrderService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

        // 检查用户今天是否已经消费过（每人每天只能消费一次）
        if (dailyVisitRecordService.hasVisitedToday(user.getId(), java.time.LocalDate.parse(date))) {
            return Result.error("您今天已经消费过了，每人每天只能消费一次");
        }
        
        BookingOrder order = new BookingOrder();
        order.setUserId(user.getId());
        order.setDate(date);
        order.setTimeSlot(timeSlot);
        order.setCabinName(cabinName);
        order.setSeatName(seatName);
        order.setPrice(price);
        order.setOriginalPrice(originalPrice);
        order.setStatus("pending"); // 默认为待核销
        order.setPaymentStatus("unpaid"); // 默认为未支付

        BookingOrder savedOrder = bookingOrderService.save(order);
        return Result.success("预约成功", savedOrder);
    }

    // 支付预约订单
    @PostMapping("/pay/{orderId}")
    public Result<String> payBooking(@RequestHeader("Authorization") String token,
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

        if ("paid".equals(order.getPaymentStatus())) {
            return Result.error("订单已支付");
        }

        // 更新订单支付状态
        order.setPaymentStatus("paid");
        order.setPaymentTime(LocalDateTime.now());
        order = bookingOrderService.save(order);

        return Result.success("支付成功");
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

        List<BookingOrder> orders = bookingOrderService.findByUserIdAndStatus(user.getId(), status);
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

        order = bookingOrderService.updateStatus(orderId, status);
        
        // 如果状态变为已完成，增加用户当日访问次数
        if ("completed".equals(status)) {
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
            if ("completed".equals(order.getStatus())) {
                return Result.error("订单已核销");
            }
            
            if (!"pending".equals(order.getStatus())) {
                return Result.error("订单状态异常，无法核销");
            }
            
            // 检查订单日期是否为今天或之前
            java.time.LocalDate orderDate = java.time.LocalDate.parse(order.getDate());
            java.time.LocalDate today = java.time.LocalDate.now();
            
            if (orderDate.isAfter(today)) {
                return Result.error("预约日期未到，无法核销");
            }
            
            // 更新订单状态为已完成
            order = bookingOrderService.updateStatus(order.getId(), "completed");
            
            // 记录核销时间
            order.setConsumeTime(java.time.LocalDateTime.now());
            order = bookingOrderService.save(order);
            
            // 增加用户当日访问次数
            dailyVisitRecordService.incrementVisitCount(order.getUserId(), orderDate);
            
            return Result.success("核销成功", order);
            
        } catch (Exception e) {
            System.err.println("核销失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("核销失败: " + e.getMessage());
        }
    }
}