package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtUtil jwtUtil;

    // 创建会员套餐支付订单
    @PostMapping("/create-package-order")
    public Result<Map<String, Object>> createPackageOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> params) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        // 处理参数转换，防止类型转换错误
        Long packageId;
        Double price;
        LocalDateTime cardStartDate = null;
        try {
            Object packageIdObj = params.get("packageId");
            if (packageIdObj instanceof Integer) {
                packageId = ((Integer) packageIdObj).longValue();
            } else {
                packageId = Long.valueOf(packageIdObj.toString());
            }
            
            Object priceObj = params.get("price");
            if (priceObj instanceof Integer) {
                price = ((Integer) priceObj).doubleValue();
            } else {
                price = Double.valueOf(priceObj.toString());
            }
            
            // 处理卡开始日期（可选参数）
            Object cardStartDateObj = params.get("cardStartDate");
            if (cardStartDateObj != null) {
                String cardStartDateStr = cardStartDateObj.toString();
                try {
                    cardStartDate = LocalDateTime.parse(cardStartDateStr + "T00:00:00");
                } catch (Exception e) {
                    // 如果解析失败，尝试其他格式
                    try {
                        cardStartDate = java.time.LocalDate.parse(cardStartDateStr).atStartOfDay();
                    } catch (Exception e2) {
                        System.err.println("解析卡开始日期失败: " + cardStartDateStr);
                    }
                }
            }
        } catch (NumberFormatException e) {
            return Result.error("参数格式错误: " + e.getMessage());
        } catch (Exception e) {
            return Result.error("参数转换错误: " + e.getMessage());
        }

        // 创建订单
        com.oxygen.capsule.entity.PaymentOrder order = paymentService.createPackageOrder(userId, packageId, price, cardStartDate);
        
        // 构建返回数据
        Map<String, Object> orderData = new java.util.HashMap<>();
        orderData.put("orderId", order.getId());
        orderData.put("orderNo", order.getOrderNo());
        orderData.put("packageId", order.getPackageId());
        orderData.put("packageName", order.getPackageName());
        orderData.put("price", order.getPrice());
        orderData.put("status", order.getStatus());
        orderData.put("cardStartDate", order.getCardStartDate());
        orderData.put("cardEndDate", order.getCardEndDate());
        orderData.put("transactionType", order.getTransactionType());
        
        return Result.success("订单创建成功", orderData);
    }

    // 获取微信支付参数
    @PostMapping("/wechat-pay/{orderId}")
    public Result<Map<String, String>> getWechatPayParams(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        // 验证订单归属
        // 获取微信支付参数
        try {
            Map<String, String> payParams = paymentService.getWechatPayParams(orderId, userId);
            
            return Result.success("获取支付参数成功", payParams);
        } catch (Exception e) {
            System.err.println("获取微信支付参数失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("获取微信支付参数失败: " + e.getMessage());
        }
    }
    
    // 支付回调接口
    @PostMapping("/notify")
    public String handlePaymentNotify(@RequestBody String notifyData) {
        try {
            // 处理支付回调
            paymentService.handlePaymentNotify(notifyData);
            
            // 微信支付回调需要返回 "success" 表示接收成功
            return "success";
        } catch (Exception e) {
            System.err.println("处理支付回调失败: " + e.getMessage());
            e.printStackTrace();
            // 微信支付回调失败需要返回 "fail"
            return "fail";
        }
    }
    
    // Mock支付成功接口（仅用于开发测试）
    @PostMapping("/mock-success/{orderId}")
    public Result<String> mockPaymentSuccess(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        try {
            // 验证订单归属
            com.oxygen.capsule.entity.PaymentOrder order = paymentService.findById(orderId);
            if (order == null || !order.getUserId().equals(userId)) {
                return Result.error("订单不存在或无权限访问");
            }
            
            // 更新订单状态为已支付
            paymentService.updateOrderStatus(orderId, "paid");
            
            return Result.success("Mock支付成功，订单状态已更新", "success");
        } catch (Exception e) {
            System.err.println("Mock支付成功处理失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("Mock支付成功处理失败: " + e.getMessage());
        }
    }
    
    // 获取用户的支付订单列表（购卡记录）
    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> getUserPaymentOrders(
            @RequestHeader("Authorization") String token) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        try {
            List<PaymentOrder> orders =
                paymentService.findByUserId(userId);
            
            // 转换为前端需要的格式
            List<Map<String, Object>> orderList = orders.stream()
                .map(order -> {
                    Map<String, Object> orderData = new java.util.HashMap<>();
                    orderData.put("id", order.getId());
                    orderData.put("orderNo", order.getOrderNo());
                    orderData.put("packageId", order.getPackageId());
                    orderData.put("packageName", order.getPackageName());
                    orderData.put("price", order.getPrice());
                    orderData.put("status", order.getStatus());
                    orderData.put("paymentTime", order.getPaymentTime());
                    orderData.put("createdAt", order.getCreatedAt());
                    orderData.put("cardStartDate", order.getCardStartDate());
                    orderData.put("cardEndDate", order.getCardEndDate());
                    orderData.put("transactionType", order.getTransactionType());
                    return orderData;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return Result.success(orderList);
        } catch (Exception e) {
            System.err.println("获取支付订单列表失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("获取支付订单列表失败: " + e.getMessage());
        }
    }
}