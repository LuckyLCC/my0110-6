package com.oxygen.capsule;

import com.oxygen.capsule.entity.Staff;
import com.oxygen.capsule.entity.enums.StaffsStatusEnum;
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
        staff.setStatus(StaffsStatusEnum.ACTIVE);
        staffService.save(staff);
        
        System.out.println("管理员账号创建成功，用户名：" + staff.getUsername());
    }


    @Test
    public void createAdminAccount2() {
        // 使用 PasswordUtil 加密密码
        String password = "liuchang";
        String encryptedPassword = PasswordUtil.encryptPassword(password);

        // 插入商家账号
        Staff staff = new Staff();
        staff.setUsername("liuchang");
        staff.setPassword(encryptedPassword);
        staff.setName("员工");
        staff.setPhone("18680815221");
        staff.setStatus(StaffsStatusEnum.ACTIVE);
        staffService.save(staff);

        System.out.println("创建成功，用户名：" + staff.getUsername());
    }
}