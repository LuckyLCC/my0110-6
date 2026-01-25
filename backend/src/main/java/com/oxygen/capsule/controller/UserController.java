package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.enums.PaymentOrdersStatusEnum;
import com.oxygen.capsule.repository.PaymentOrderRepository;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import com.oxygen.capsule.util.WechatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private WechatUtil wechatUtil;
    
    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    // 用户登录/注册接口（真实微信登录）
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, Object> params) {
        String code = (String) params.get("code");
        String nickname = (String) params.get("nickname");
        String avatarUrl = (String) params.get("avatarUrl");
        
        // 调试日志
        System.out.println("========== 用户登录 ==========");
        System.out.println("收到参数 - code: " + (code != null ? "已提供" : "未提供"));
        System.out.println("收到参数 - nickname: " + nickname);
        System.out.println("收到参数 - avatarUrl: " + (avatarUrl != null ? "已提供" : "未提供"));
        
        if (code == null || code.trim().isEmpty()) {
            return Result.error("缺少登录凭证code");
        }
        
        try {
            // 调用微信接口获取openid
            Map<String, String> wxResult = wechatUtil.getOpenidAndSessionKey(code);
            String openid = wxResult.get("openid");
            
            if (openid == null || openid.isEmpty()) {
                return Result.error("微信登录失败: 未获取到openid");
            }
            
            // 查询或创建用户
            User user = userService.findByOpenid(openid);
            boolean isNewUser = false;
            if (user == null) {
                // 创建新用户
                isNewUser = true;
                user = new User();
                user.setOpenid(openid);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
            }
            
            // 更新或设置用户昵称和头像（如果提供了）
            // 对于新用户：如果提供了昵称就使用，否则使用默认值
            // 对于老用户：如果提供了昵称就更新（即使原来有昵称也更新，因为可能是用户重新授权）
            String oldNickname = user.getNickname();
            if (nickname != null && !nickname.trim().isEmpty()) {
                user.setNickname(nickname);
                System.out.println("设置用户昵称: " + nickname + (isNewUser ? " (新用户)" : " (老用户，原昵称: " + oldNickname + ")"));
            } else if (isNewUser) {
                // 新用户且没有提供昵称，使用默认值
                String defaultNickname = "微信用户" + System.currentTimeMillis();
                user.setNickname(defaultNickname);
                System.out.println("新用户未提供昵称，使用默认值: " + defaultNickname);
            } else {
                System.out.println("老用户未提供昵称，保持原有昵称: " + oldNickname);
            }
            // 注意：老用户如果没有提供昵称，保持原有昵称不变
            
            if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
                System.out.println("设置用户头像: " + avatarUrl);
            }
            
            // 更新用户登录时间
            user.setLastLoginTime(LocalDateTime.now());
            user = userService.save(user);
            
            // 生成JWT token
            String token = jwtUtil.generateToken(user.getId());
            
            // 构建返回数据
            Map<String, Object> userInfoMap = new java.util.HashMap<>();
            userInfoMap.put("id", user.getId());
            userInfoMap.put("openid", user.getOpenid());
            userInfoMap.put("nickname", user.getNickname());
            userInfoMap.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            userInfoMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
            userInfoMap.put("role", user.getRole() != null ? user.getRole().getCode().toLowerCase() : "user");
            
            Map<String, Object> responseData = new java.util.HashMap<>();
            responseData.put("token", token);
            responseData.put("userInfo", userInfoMap);
            
            return Result.success("登录成功", responseData);
        } catch (Exception e) {
            // 获取详细的错误信息
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName();
                // 如果有 cause，也包含进来
                if (e.getCause() != null) {
                    String causeMsg = e.getCause().getMessage();
                    if (causeMsg != null && !causeMsg.isEmpty()) {
                        errorMsg += ": " + causeMsg;
                    } else {
                        errorMsg += ": " + e.getCause().getClass().getSimpleName();
                    }
                }
            }
            
            // 记录完整的异常堆栈到日志
            e.printStackTrace();
            
            return Result.error("微信登录失败: " + errorMsg);
        }
    }

    // 获取用户信息
    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        // 获取用户最新的已支付订单，用于显示卡种名称
        String packageName = null;
        boolean hasMembershipCard = false;
        try {
            List<PaymentOrder> paidOrders = 
                paymentOrderRepository.findByUserIdAndStatus(userId, PaymentOrdersStatusEnum.PAID);
            if (paidOrders != null && !paidOrders.isEmpty()) {
                // 按支付时间倒序排列，获取最新的订单
                paidOrders.sort((a, b) -> {
                    if (a.getPaymentTime() == null && b.getPaymentTime() == null) return 0;
                    if (a.getPaymentTime() == null) return 1;
                    if (b.getPaymentTime() == null) return -1;
                    return b.getPaymentTime().compareTo(a.getPaymentTime());
                });
                packageName = paidOrders.get(0).getPackageName();
                
                // 检查用户是否有生效中的会员卡
                for (PaymentOrder po : paidOrders) {
                    if (po.getCardStatus() == com.oxygen.capsule.entity.enums.PaymentOrdersCardStatusEnum.ACTIVE) {
                        hasMembershipCard = true;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("获取用户套餐信息失败: " + e.getMessage());
        }
        
        // 构建返回数据
        Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", user.getId());
        userData.put("openid", user.getOpenid());
        userData.put("nickname", user.getNickname());
        userData.put("avatarUrl", user.getAvatarUrl());
        userData.put("phone", user.getPhone());
        userData.put("memberLevel", user.getMemberLevel());
        userData.put("memberExpireTime", user.getMemberExpireTime());
        userData.put("totalVisits", user.getTotalVisits());
        userData.put("remainingVisits", user.getRemainingVisits());
        userData.put("points", user.getPoints());
        userData.put("packageName", packageName); // 添加套餐名称
        userData.put("hasMembershipCard", hasMembershipCard); // 是否有卡种会员
        
        return Result.success(userData);
    }

    // 更新用户信息
    @PostMapping("/update-info")
    public Result<User> updateUserInfo(@RequestHeader("Authorization") String token,
                                       @RequestParam(required = false) String nickname,
                                       @RequestParam(required = false) String avatarUrl) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        user = userService.updateUserInfo(user.getId(), nickname, avatarUrl);
        return Result.success("更新成功", user);
    }

    // 绑定手机号
    @PostMapping("/bind-phone")
    public Result<User> bindPhone(@RequestHeader("Authorization") String token,
                                  @RequestParam String phone) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        user = userService.bindPhone(user.getId(), phone);
        return Result.success("绑定成功", user);
    }
}