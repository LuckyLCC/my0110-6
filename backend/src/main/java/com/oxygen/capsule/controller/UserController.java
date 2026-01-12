package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // 用户登录/注册接口（模拟微信登录）
    @PostMapping("/login")
    public Result<String> login(@RequestParam String code) {
        // 这里应该调用微信登录API获取openid
        // 为了演示，我们使用模拟的openid
        String openid = "mock_openid_" + System.currentTimeMillis();
        
        User user = userService.findByOpenid(openid);
        if (user == null) {
            // 创建新用户
            user = new User();
            user.setOpenid(openid);
            user.setNickname("微信用户");
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userService.save(user);
        }

        // 生成JWT token
        String token = jwtUtil.generateToken(openid);
        return Result.success("登录成功", token);
    }

    // 获取用户信息
    @GetMapping("/info")
    public Result<User> getUserInfo(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);
        
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
        
        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);
        
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
        
        String openid = jwtUtil.getOpenidFromToken(token.substring(7));
        User user = userService.findByOpenid(openid);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        user = userService.bindPhone(user.getId(), phone);
        return Result.success("绑定成功", user);
    }
}