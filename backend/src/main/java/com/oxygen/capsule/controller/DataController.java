package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.service.MemberPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private MemberPackageService memberPackageService;

    // 初始化会员套餐数据
    @PostMapping("/init-packages")
    public Result<String> initPackages() {
        // 检查是否已有数据
        List<MemberPackage> existingPackages = memberPackageService.findAll();
        if (!existingPackages.isEmpty()) {
            return Result.error("已有套餐数据，无法重复初始化");
        }

        try {
            // 读取JSON文件
            ClassPathResource resource = new ClassPathResource("氧舱会员卡价格表（简洁完整版）.json");
            InputStream inputStream = resource.getInputStream();
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 解析JSON
            Map<String, Object> jsonMap = objectMapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> cards = (List<Map<String, Object>>) jsonMap.get("cards");

            // 遍历并创建会员套餐
            for (Map<String, Object> card : cards) {
                MemberPackage memberPackage = new MemberPackage();
                memberPackage.setCode((String) card.get("code"));
                memberPackage.setName((String) card.get("name"));
                memberPackage.setPrice(Double.valueOf((Integer) card.get("price")));
                memberPackage.setPeople((Integer) card.get("people"));
                memberPackage.setValidDays((Integer) card.get("valid_days"));
                
                // avg_price_per_time 可能不存在
                if (card.containsKey("avg_price_per_time")) {
                    memberPackage.setAvgPricePerTime(Double.valueOf((Integer) card.get("avg_price_per_time")));
                }
                
                // times_per_person 可能不存在
                if (card.containsKey("times_per_person")) {
                    memberPackage.setTimesPerPerson((Integer) card.get("times_per_person"));
                }
                
                // 设置分类
                String name = (String) card.get("name");
                if (name.contains("人") && !name.contains("1人")) {
                    memberPackage.setCategory("多人尊享");
                } else if (name.contains("次卡")) {
                    memberPackage.setCategory("家庭/次卡");
                } else {
                    memberPackage.setCategory("个人畅享");
                }
                
                memberPackage.setIsActive(true);
                memberPackage.setSortOrder(0);
                
                memberPackageService.save(memberPackage);
            }

            return Result.success("套餐数据初始化成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("初始化套餐数据失败: " + e.getMessage());
        }
    }
}