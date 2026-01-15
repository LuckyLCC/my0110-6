package com.oxygen.capsule;

import com.oxygen.capsule.entity.Staff;
import com.oxygen.capsule.service.StaffService;
import com.oxygen.capsule.util.PasswordUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class StaffTest {

    @Autowired
    private StaffService staffService;

    @Test
    public void createAdminAccount() {
        // 使用 PasswordUtil 加密密码
        String password = "admin";
        String encryptedPassword = PasswordUtil.encryptPassword(password);

        // 插入商家账号
        Staff staff = new Staff();
        staff.setUsername("admin");
        staff.setPassword(encryptedPassword);
        staff.setName("管理员");
        staff.setPhone("13800138000");
        staff.setStatus("active");
        staffService.save(staff);
        
        System.out.println("管理员账号创建成功，用户名：" + staff.getUsername());
    }
}