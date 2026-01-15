package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.Staff;
import com.oxygen.capsule.service.StaffService;
import com.oxygen.capsule.util.JwtUtil;
import com.oxygen.capsule.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private JwtUtil jwtUtil;

    // 商家登录（用户名密码）
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        
        if (username == null || username.trim().isEmpty()) {
            return Result.error("请输入用户名");
        }
        
        if (password == null || password.trim().isEmpty()) {
            return Result.error("请输入密码");
        }
        
        try {
            // 根据用户名查找商家
            Staff staff = staffService.findByUsername(username.trim());
            
            if (staff == null) {
                return Result.error("用户名或密码错误");
            }
            
            // 检查商家状态
            if (!"active".equals(staff.getStatus())) {
                return Result.error("该账号已被停用，请联系管理员");
            }
            
            // 验证密码
            if (staff.getPassword() == null || staff.getPassword().isEmpty()) {
                return Result.error("该账号未设置密码，请联系管理员");
            }
            
            // 使用SHA-256验证密码
            String encryptedPassword = PasswordUtil.encryptPassword(password);
            if (!encryptedPassword.equals(staff.getPassword())) {
                return Result.error("用户名或密码错误");
            }
            
            // 更新商家登录时间
            staff.setLastLoginTime(LocalDateTime.now());
            staff = staffService.save(staff);
            
            // 生成JWT token（使用 staff 前缀区分商家token）
            String token = jwtUtil.generateToken(staff.getId());
            
            // 构建返回数据
            Map<String, Object> staffInfoMap = new HashMap<>();
            staffInfoMap.put("id", staff.getId());
            staffInfoMap.put("username", staff.getUsername());
            staffInfoMap.put("name", staff.getName() != null ? staff.getName() : "");
            staffInfoMap.put("phone", staff.getPhone() != null ? staff.getPhone() : "");
            staffInfoMap.put("role", "staff");
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("userInfo", staffInfoMap);
            
            return Result.success("登录成功", responseData);
        } catch (Exception e) {
            System.err.println("商家登录失败: " + e.getMessage());
            e.printStackTrace();
            return Result.error("登录失败: " + e.getMessage());
        }
    }

    // 获取商家信息
    @GetMapping("/info")
    public Result<Map<String, Object>> getStaffInfo(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return Result.error("未提供有效的认证令牌");
        }
        
        Long staffId = jwtUtil.getUserIdFromToken(token.substring(7));
        Staff staff = staffService.findById(staffId).orElse(null);
        
        if (staff == null) {
            return Result.error("商家不存在");
        }
        
        // 构建返回数据
        Map<String, Object> staffData = new HashMap<>();
        staffData.put("id", staff.getId());
        staffData.put("username", staff.getUsername());
        staffData.put("name", staff.getName());
        staffData.put("phone", staff.getPhone());
        staffData.put("status", staff.getStatus());
        staffData.put("role", "staff");
        
        return Result.success(staffData);
    }
}

