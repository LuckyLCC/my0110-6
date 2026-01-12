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

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingOrderService bookingOrderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // 创建预约订单
    @PostMapping("/create")
    public Result<BookingOrder> createBooking(@RequestHeader("Authorization") String token,
                                              @RequestParam String date,
                                              @RequestParam String timeSlot,
                                              @RequestParam String cabinName,
                                              @RequestParam String seatName,
                                              @RequestParam Double price,
                                              @RequestParam(required = false) Double originalPrice) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);

        if (user == null) {
            return Result.error("用户不存在");
        }

        // 检查该时间段该座位是否已被预订
        // 这里可以添加检查逻辑，防止重复预订同一座位
        
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

    // 获取用户的所有预约订单
    @GetMapping("/orders")
    public Result<List<BookingOrder>> getUserOrders(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);

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

        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);

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

        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        order = bookingOrderService.updateStatus(orderId, status);
        return Result.success("状态更新成功", order);
    }

    // 获取订单详情
    @GetMapping("/order/{orderId}")
    public Result<BookingOrder> getOrderDetail(@RequestHeader("Authorization") String token,
                                               @PathVariable Long orderId) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);

        if (user == null) {
            return Result.error("用户不存在");
        }

        BookingOrder order = bookingOrderService.findById(orderId);
        if (order == null || !order.getUserId().equals(user.getId())) {
            return Result.error("订单不存在或无权限访问");
        }

        return Result.success(order);
    }
}