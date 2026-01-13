package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import com.oxygen.capsule.util.WechatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    // 用户登录/注册接口（真实微信登录）
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        
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
            if (user == null) {
                // 创建新用户
                user = new User();
                user.setOpenid(openid);
                user.setNickname("微信用户" + System.currentTimeMillis());
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                user = userService.save(user);
            }
            
            // 更新用户登录时间
            user.setLastLoginTime(LocalDateTime.now());
            user = userService.save(user);
            
            // 生成JWT token
            String token = jwtUtil.generateToken(user.getId());
            
            // 构建返回数据
            Map<String, Object> responseData = Map.of(
                "token", token,
                "userInfo", Map.of(
                    "id", user.getId(),
                    "openid", user.getOpenid(),
                    "nickname", user.getNickname(),
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                    "phone", user.getPhone() != null ? user.getPhone() : ""
                )
            );
            
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
    public Result<User> getUserInfo(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        User user = userService.findById(userId).orElse(null);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        return Result.success(user);
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