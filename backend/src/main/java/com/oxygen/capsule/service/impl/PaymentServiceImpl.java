package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.entity.enums.PaymentOrdersCardStatusEnum;
import com.oxygen.capsule.entity.enums.PaymentOrdersStatusEnum;
import com.oxygen.capsule.entity.enums.PaymentOrdersTransactionTypeEnum;
import com.oxygen.capsule.repository.PaymentOrderRepository;
import com.oxygen.capsule.service.MemberPackageService;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.WxPayUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Slf4j
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
    public PaymentOrder createPackageOrder(Long userId, Long packageId, Double price, LocalDateTime cardStartDate) {
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
            order.setStatus(PaymentOrdersStatusEnum.UNPAID);
            
            // 先检查用户是否有已支付的购卡记录（排除当前正在创建的订单）
            // 注意：这里查询的是已支付的订单，不包括当前未支付的订单
            // 简化逻辑：有已支付的购卡记录就是续费，没有就是新开卡
            List<PaymentOrder> paidOrders = paymentOrderRepository.findByUserIdAndStatus(userId, PaymentOrdersStatusEnum.PAID);
            boolean hasPaidOrders = paidOrders != null && !paidOrders.isEmpty();
            
            // 调试日志：输出查询结果
            System.out.println("========== 创建订单 - 交易类型判断 ==========");
            System.out.println("用户ID: " + userId);
            System.out.println("已支付订单数量: " + (paidOrders != null ? paidOrders.size() : 0));
            if (paidOrders != null && !paidOrders.isEmpty()) {
                System.out.println("已支付订单列表:");
                for (PaymentOrder po : paidOrders) {
                    System.out.println("  - 订单ID: " + po.getId() + ", 状态: " + po.getStatus() + ", 交易类型: " + po.getTransactionType() + ", 创建时间: " + po.getCreatedAt());
                }
            }
            System.out.println("是否有已支付订单: " + hasPaidOrders);
            
            // 使用用户选择的卡开始日期，如果没有提供则使用默认逻辑
            LocalDateTime currentTime = LocalDateTime.now();
            LocalDateTime finalCardStartDate;
            PaymentOrdersTransactionTypeEnum transactionType;
            
            // 简化逻辑：有已支付的购卡记录就是续费，没有就是新开卡
            if (hasPaidOrders) {
                // 有已支付的购卡记录，判断为续费
                transactionType = PaymentOrdersTransactionTypeEnum.RENEW;
                System.out.println("判断为续费：用户有已支付的购卡记录");
                
                // 如果没有提供卡开始日期，且用户有未过期的会员，从会员到期时间开始
                if (cardStartDate == null && user.getMemberExpireTime() != null && user.getMemberExpireTime().isAfter(currentTime)) {
                    finalCardStartDate = user.getMemberExpireTime();
                    System.out.println("续费：从会员到期时间开始: " + finalCardStartDate);
                } else if (cardStartDate != null) {
                    // 使用用户选择的日期
                    finalCardStartDate = cardStartDate;
                    System.out.println("续费：使用用户选择的日期: " + finalCardStartDate);
                } else {
                    // 没有会员到期时间或已过期，从当前时间开始
                    finalCardStartDate = currentTime;
                    System.out.println("续费：从当前时间开始: " + finalCardStartDate);
                }
            } else {
                // 没有已支付的购卡记录，判断为新开卡（第一次购买）
                transactionType = PaymentOrdersTransactionTypeEnum.NEW;
                System.out.println("判断为新开卡：用户没有已支付的购卡记录");
                
                if (cardStartDate != null) {
                    finalCardStartDate = cardStartDate;
                    System.out.println("新开卡：使用用户选择的日期: " + finalCardStartDate);
                } else {
                    finalCardStartDate = currentTime;
                    System.out.println("新开卡：从当前时间开始: " + finalCardStartDate);
                }
            }
            
            // 调试日志：输出最终判断结果
            System.out.println("========== 最终判断结果 ==========");
            System.out.println("订单交易类型: " + transactionType);
            System.out.println("卡开始日期: " + finalCardStartDate);
            System.out.println("===================================");
            
            order.setTransactionType(transactionType);
            order.setCardStartDate(finalCardStartDate);
            
            // 计算卡到期日期：根据套餐的有效期天数
            LocalDateTime cardEndDate = null;
            if (pkg.getValidDays() != null && pkg.getValidDays() > 0) {
                cardEndDate = finalCardStartDate.plusDays(pkg.getValidDays());
            } else if (pkg.getValidDays() == -1) {
                // 无限期，设置为null
                cardEndDate = null;
            } else {
                // 默认30天
                cardEndDate = finalCardStartDate.plusDays(30);
            }
            order.setCardEndDate(cardEndDate);
            
            // 如果是次卡，设置初始剩余次数
            if ("家庭/次卡".equals(pkg.getCategory()) && pkg.getTimesPerPerson() != null) {
                order.setRemainingTimes(pkg.getTimesPerPerson());
            } else {
                // 其他卡种不记录剩余次数
                order.setRemainingTimes(null);
            }
            
            // 计算并设置初始卡状态
            PaymentOrdersCardStatusEnum initialCardStatus = calculateCardStatus(order, pkg);
            order.setCardStatus(initialCardStatus);
    
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
            PaymentOrdersStatusEnum next = PaymentOrdersStatusEnum.fromDb(status);
            order.setStatus(next);
            if (next == PaymentOrdersStatusEnum.PAID) {
                order.setPaymentTime(LocalDateTime.now());
                
                // 获取套餐信息
                MemberPackage pkg = memberPackageService.findById(order.getPackageId());
                if (pkg != null) {
                    // 如果是次卡且剩余次数未设置，设置初始剩余次数
                    if ("家庭/次卡".equals(pkg.getCategory()) && pkg.getTimesPerPerson() != null && order.getRemainingTimes() == null) {
                        order.setRemainingTimes(pkg.getTimesPerPerson());
                    }
                    
                    // 重新计算并更新卡状态
                    PaymentOrdersCardStatusEnum cardStatus = calculateCardStatus(order, pkg);
                    order.setCardStatus(cardStatus);
                } else {
                    // 如果套餐不存在，设置默认状态
                    System.err.println("警告：订单 " + order.getId() + " 的套餐不存在，设置默认卡状态");
                    if (order.getCardStatus() == null) {
                        order.setCardStatus(PaymentOrdersCardStatusEnum.INACTIVE);
                    }
                }
                
                // 支付成功后，更新用户会员信息
                updateUserInfoForPaidOrder(order);
            }
            order = paymentOrderRepository.save(order);
        }
        return order;
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
     * 更新卡状态（供外部调用，例如核销后更新次卡状态）
     * 如果是次卡，同时减少剩余次数
     */
    @Override
    public void updateCardStatus(Long paymentOrderId) {
        PaymentOrder order = findById(paymentOrderId);
        if (order != null && order.getStatus() == PaymentOrdersStatusEnum.PAID) {
            MemberPackage pkg = memberPackageService.findById(order.getPackageId());
            if (pkg != null) {
                // 如果是次卡，减少剩余次数
                if ("家庭/次卡".equals(pkg.getCategory()) && order.getRemainingTimes() != null && order.getRemainingTimes() > 0) {
                    order.setRemainingTimes(order.getRemainingTimes() - 1);
                }
                
                // 重新计算并更新卡状态
                PaymentOrdersCardStatusEnum cardStatus = calculateCardStatus(order, pkg);
                order.setCardStatus(cardStatus);
                paymentOrderRepository.save(order);
            }
        }
    }

    @Override
    public void refundTimesCard(Long paymentOrderId) {
        PaymentOrder order = findById(paymentOrderId);
        if (order != null && order.getStatus() == PaymentOrdersStatusEnum.PAID) {
            MemberPackage pkg = memberPackageService.findById(order.getPackageId());
            if (pkg != null && "家庭/次卡".equals(pkg.getCategory())) {
                // 如果是次卡，返还一次次数
                if (order.getRemainingTimes() != null) {
                    order.setRemainingTimes(order.getRemainingTimes() + 1);
                } else {
                    // 如果剩余次数为null，初始化为1
                    order.setRemainingTimes(1);
                }
                
                // 重新计算并更新卡状态
                PaymentOrdersCardStatusEnum cardStatus = calculateCardStatus(order, pkg);
                order.setCardStatus(cardStatus);
                paymentOrderRepository.save(order);
                log.info("次卡返还次数成功，订单ID: {}, 剩余次数: {}", paymentOrderId, order.getRemainingTimes());
            }
        }
    }

    @Override
    public PaymentOrder findByOrderNo(String orderNo) {
        return paymentOrderRepository.findByOrderNo(orderNo).orElse(null);
    }
    
    @Override
    public List<PaymentOrder> findByUserId(Long userId) {
        return paymentOrderRepository.findByUserId(userId);
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
            wxPayUtil.handlePayNotify(notifyData);
            
            // 解析回调数据并提取订单号
            String outTradeNo = extractOrderNo(notifyData);
            
            if (outTradeNo != null && !outTradeNo.isEmpty()) {
                PaymentOrder order = findByOrderNo(outTradeNo);
                if (order != null && order.getStatus() != PaymentOrdersStatusEnum.PAID) {
                    // 更新订单状态为已支付
                    updateOrderStatus(order.getId(), PaymentOrdersStatusEnum.PAID.name());
                    
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
        try {
            // 获取用户信息
            User user = userService.findById(order.getUserId()).orElse(null);
            if (user == null) {
                System.err.println("用户不存在，无法更新会员信息: " + order.getUserId());
                return;
            }
            
            // 获取套餐信息
            MemberPackage pkg = memberPackageService.findById(order.getPackageId());
            if (pkg == null) {
                System.err.println("套餐不存在，无法更新会员信息: " + order.getPackageId());
                return;
            }
            
            // 更新会员等级
            user.setMemberLevel(1); // 设置为会员
            
            // 计算会员到期时间
            LocalDateTime currentTime = LocalDateTime.now();
            LocalDateTime expireTime = null;
            
            if (pkg.getValidDays() != null && pkg.getValidDays() > 0) {
                // 如果用户已有会员到期时间，且未过期，则延长到期时间
                if (user.getMemberExpireTime() != null && user.getMemberExpireTime().isAfter(currentTime)) {
                    // 在现有到期时间基础上延长
                    expireTime = user.getMemberExpireTime().plusDays(pkg.getValidDays());
                } else {
                    // 从当前时间开始计算
                    expireTime = currentTime.plusDays(pkg.getValidDays());
                }
            } else if (pkg.getValidDays() == -1) {
                // 无限期会员
                expireTime = null; // null 表示无限期
            } else {
                // 默认30天
                if (user.getMemberExpireTime() != null && user.getMemberExpireTime().isAfter(currentTime)) {
                    expireTime = user.getMemberExpireTime().plusDays(30);
                } else {
                    expireTime = currentTime.plusDays(30);
                }
            }
            
            user.setMemberExpireTime(expireTime);
            
            // 更新剩余次数（根据套餐类型）
            if (pkg.getTimesPerPerson() != null && pkg.getTimesPerPerson() > 0) {
                // 如果套餐有次数限制，增加剩余次数
                int currentRemaining = user.getRemainingVisits() != null ? user.getRemainingVisits() : 0;
                user.setRemainingVisits(currentRemaining + pkg.getTimesPerPerson());
            } else {
                // 无限次数，设置为-1或保持原值
                // 这里可以根据业务需求设置
            }
            
            // 保存用户信息
            userService.save(user);
            
            System.out.println("成功更新用户" + order.getUserId() + "的会员信息，购买了套餐" + order.getPackageName() + 
                "，到期时间: " + (expireTime != null ? expireTime.toString() : "无限期"));
        } catch (Exception e) {
            System.err.println("更新用户会员信息失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}