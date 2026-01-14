package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
        } catch (NumberFormatException e) {
            return Result.error("参数格式错误: " + e.getMessage());
        } catch (Exception e) {
            return Result.error("参数转换错误: " + e.getMessage());
        }

        // 创建订单
        com.oxygen.capsule.entity.PaymentOrder order = paymentService.createPackageOrder(userId, packageId, price);
        
        // 构建返回数据
        Map<String, Object> orderData = Map.of(
            "orderId", order.getId(),
            "orderNo", order.getOrderNo(),
            "packageId", order.getPackageId(),
            "packageName", order.getPackageName(),
            "price", order.getPrice(),
            "status", order.getStatus()
        );
        
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
}