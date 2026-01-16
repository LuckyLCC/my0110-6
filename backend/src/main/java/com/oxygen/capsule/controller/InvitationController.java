package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.Invitation;
import com.oxygen.capsule.service.InvitationService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitation")
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // 生成邀请码
    @PostMapping("/generate")
    public Result<Map<String, Object>> generateInviteCode(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> params) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        try {
            // 获取支付订单ID
            Long paymentOrderId = Long.parseLong(params.get("paymentOrderId").toString());
            
            // 生成邀请码
            Invitation invitation = invitationService.generateInviteCode(userId, paymentOrderId);
            
            // 构建返回数据
            Map<String, Object> result = new HashMap<>();
            result.put("inviteCode", invitation.getInviteCode());
            result.put("invitationId", invitation.getId());
            result.put("expiredAt", invitation.getExpiredAt());
            
            return Result.success("邀请码生成成功", result);
        } catch (Exception e) {
            System.err.println("生成邀请码失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("生成邀请码失败: " + e.getMessage());
        }
    }

    // 接受邀请（需要登录）
    @PostMapping("/accept")
    public Result<Map<String, Object>> acceptInvitation(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> params) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long inviteeId = jwtUtil.getUserIdFromToken(token.substring(7));
        String inviteCode = params.get("inviteCode");
        
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            return Result.error("邀请码不能为空");
        }
        
        try {
            Map<String, Object> result = invitationService.acceptInvitation(inviteCode.trim(), inviteeId);
            return Result.success("绑定成功", result);
        } catch (Exception e) {
            System.err.println("接受邀请失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("接受邀请失败: " + e.getMessage());
        }
    }

    // 接受邀请（通过微信code，无需登录，如果用户不存在则创建）
    @PostMapping("/accept-by-code")
    public Result<Map<String, Object>> acceptInvitationByCode(@RequestBody Map<String, String> params) {
        String inviteCode = params.get("inviteCode");
        String wechatCode = params.get("code");
        
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            return Result.error("邀请码不能为空");
        }
        
        if (wechatCode == null || wechatCode.trim().isEmpty()) {
            return Result.error("微信登录凭证不能为空");
        }
        
        try {
            Map<String, Object> result = invitationService.acceptInvitationByCode(inviteCode.trim(), wechatCode.trim());
            
            // 获取用户信息并生成 token
            String openid = (String) result.get("openid");
            if (openid != null) {
                com.oxygen.capsule.entity.User user = userService.findByOpenid(openid);
                if (user != null) {
                    String token = jwtUtil.generateToken(user.getId());
                    result.put("token", token);
                    
                    // 添加用户信息
                    Map<String, Object> userInfo = new java.util.HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("openid", user.getOpenid());
                    userInfo.put("nickname", user.getNickname());
                    userInfo.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
                    userInfo.put("phone", user.getPhone() != null ? user.getPhone() : "");
                    userInfo.put("role", "user");
                    result.put("userInfo", userInfo);
                }
            }
            
            return Result.success("绑定成功", result);
        } catch (Exception e) {
            System.err.println("接受邀请失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("接受邀请失败: " + e.getMessage());
        }
    }

    // 获取用户的邀请列表
    @GetMapping("/list")
    public Result<List<Invitation>> getInvitations(
            @RequestHeader("Authorization") String token) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }

        Long userId = jwtUtil.getUserIdFromToken(token.substring(7));
        
        try {
            List<Invitation> invitations = invitationService.getInvitationsByInviter(userId);
            return Result.success(invitations);
        } catch (Exception e) {
            System.err.println("获取邀请列表失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("获取邀请列表失败: " + e.getMessage());
        }
    }

    // 根据邀请码查询邀请信息（用于验证邀请码是否有效）
    @GetMapping("/code/{inviteCode}")
    public Result<Invitation> getInvitationByCode(@PathVariable String inviteCode) {
        try {
            Invitation invitation = invitationService.findByInviteCode(inviteCode);
            if (invitation == null) {
                return Result.error("邀请码不存在");
            }
            return Result.success(invitation);
        } catch (Exception e) {
            System.err.println("查询邀请信息失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("查询邀请信息失败: " + e.getMessage());
        }
    }
}

