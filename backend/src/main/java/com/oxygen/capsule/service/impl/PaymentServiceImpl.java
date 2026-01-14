package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.repository.PaymentOrderRepository;
import com.oxygen.capsule.service.MemberPackageService;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.WxPayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private MemberPackageService memberPackageService;

    @Autowired
    private UserService userService;

    @Autowired
    private WxPayUtil wxPayUtil;

    @Override
    public PaymentOrder createPackageOrder(Long userId, Long packageId, Double price) {
        try {
            // 验证用户是否存在
            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }
    
            // 验证套餐是否存在
            MemberPackage pkg = memberPackageService.findById(packageId);
            if (pkg == null) {
                throw new RuntimeException("套餐不存在");
            }
    
            // 创建支付订单
            PaymentOrder order = new PaymentOrder();
            order.setUserId(userId);
            order.setPackageId(packageId);
            order.setPackageName(pkg.getName());
            order.setPrice(price);
            order.setStatus("unpaid");
    
            return paymentOrderRepository.save(order);
        } catch (Exception e) {
            System.err.println("创建支付订单失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Map<String, String> getWechatPayParams(Long orderId, Long userId) {
        try {
            // 验证订单归属
            PaymentOrder order = findById(orderId);
            if (order == null || !order.getUserId().equals(userId)) {
                throw new RuntimeException("订单不存在或无权限访问");
            }
            
            // 获取用户信息以获取openid
            User user = userService.findById(userId).orElse(null);
            if (user == null || user.getOpenid() == null) {
                throw new RuntimeException("用户信息异常");
            }
            
            // 将价格转换为分（微信支付以分为单位）
            int amount = (int) Math.round(order.getPrice() * 100);
            
            // 调用微信支付工具类生成支付参数
            return wxPayUtil.generatePayParams(
                order.getId().toString(), 
                order.getOrderNo(), 
                amount, 
                user.getOpenid()
            );
        } catch (com.github.binarywang.wxpay.exception.WxPayException e) {
            System.err.println("获取微信支付参数失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("获取微信支付参数失败: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("获取微信支付参数异常: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("获取微信支付参数异常: " + e.getMessage());
        }
    }

    @Override
    public PaymentOrder findById(Long id) {
        return paymentOrderRepository.findById(id).orElse(null);
    }

    @Override
    public PaymentOrder updateOrderStatus(Long orderId, String status) {
        PaymentOrder order = findById(orderId);
        if (order != null) {
            order.setStatus(status);
            if ("paid".equals(status)) {
                order.setPaymentTime(LocalDateTime.now());
            }
            order = paymentOrderRepository.save(order);
        }
        return order;
    }

    @Override
    public PaymentOrder findByOrderNo(String orderNo) {
        return paymentOrderRepository.findByOrderNo(orderNo).orElse(null);
    }

    private String generateNonceStr() {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 32; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String generateRandomString(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    @Override
    public void handlePaymentNotify(String notifyData) {
        // 实际应用中，这里需要：
        // 1. 验证微信支付回调签名
        // 2. 解析回调数据
        // 3. 根据订单号更新订单状态为已支付
        // 4. 可能还需要更新用户会员信息
        
        System.out.println("处理支付回调数据: " + notifyData);
        
        try {
            // 使用微信支付工具类处理回调
            String result = wxPayUtil.handlePayNotify(notifyData);
            
            // 解析回调数据并提取订单号
            String outTradeNo = extractOrderNo(notifyData);
            
            if (outTradeNo != null && !outTradeNo.isEmpty()) {
                PaymentOrder order = findByOrderNo(outTradeNo);
                if (order != null && !"paid".equals(order.getStatus())) {
                    // 更新订单状态为已支付
                    updateOrderStatus(order.getId(), "paid");
                    
                    // 可选：根据套餐类型更新用户会员级别或权益
                    updateUserInfoForPaidOrder(order);
                    
                    System.out.println("订单支付成功，订单号: " + outTradeNo);
                } else {
                    System.out.println("未找到对应订单或订单已支付: " + outTradeNo);
                }
            }
        } catch (com.github.binarywang.wxpay.exception.WxPayException e) {
            System.err.println("处理支付回调时发生微信支付错误: " + e.getMessage());
            e.printStackTrace();
            // 不再向上抛出WxPayException，因为接口未声明抛出此异常
        } catch (Exception e) {
            System.err.println("处理支付回调时发生其他错误: " + e.getMessage());
            e.printStackTrace();
            // 不再向上抛出异常，因为接口未声明抛出此异常
        }
    }
    
    // 提取订单号的方法（简化实现）
    private String extractOrderNo(String notifyData) {
        // 实际应用中需要解析微信支付回调的XML数据
        // 这里简化处理
        if (notifyData.contains("out_trade_no")) {
            // 简化的解析逻辑，实际应用中需要使用XML解析器
            int start = notifyData.indexOf("<out_trade_no>");
            int end = notifyData.indexOf("</out_trade_no>");
            if (start != -1 && end != -1) {
                return notifyData.substring(start + 14, end);
            }
        }
        return null;
    }
    
    // 更新用户信息以反映支付成功的订单
    private void updateUserInfoForPaidOrder(PaymentOrder order) {
        // 这里可以根据购买的套餐类型更新用户信息
        // 例如，更新会员等级、到期时间等
        System.out.println("更新用户" + order.getUserId() + "的会员信息，购买了套餐" + order.getPackageName());
        
        // 实际实现可能包括：
        // 1. 延长会员到期时间
        // 2. 更新会员等级
        // 3. 增加用户积分等
    }
}