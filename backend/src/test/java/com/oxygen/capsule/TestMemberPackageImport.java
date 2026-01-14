package com.oxygen.capsule;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.service.MemberPackageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class TestMemberPackageImport {

    @Autowired
    private MemberPackageService memberPackageService;

    @Test
    @Transactional
    public void importMemberPackageDataFromJson() throws Exception {
        System.out.println("开始导入会员套餐数据...");
        
        // 读取JSON文件
        ClassPathResource resource = new ClassPathResource("氧舱会员卡价格表（简洁完整版）.json");
        InputStream inputStream = resource.getInputStream();
        ObjectMapper objectMapper = new ObjectMapper();
        
        // 解析JSON
        Map<String, Object> jsonMap = objectMapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {});
        List<Map<String, Object>> cards = (List<Map<String, Object>>) jsonMap.get("cards");

        int importedCount = 0;
        // 遍历并创建会员套餐
        for (Map<String, Object> card : cards) {
            String code = (String) card.get("code");
            
            // 检查套餐是否已存在
            MemberPackage existingPackage = memberPackageService.findByCode(code);
            if (existingPackage == null) {
                MemberPackage memberPackage = new MemberPackage();
                memberPackage.setCode(code);
                memberPackage.setName((String) card.get("name"));
                memberPackage.setPrice(Double.valueOf((Integer) card.get("price")));
                memberPackage.setPeople((Integer) card.get("people"));
                
                // 根据JSON中字段名灵活处理
                if (card.containsKey("validity_days")) {
                    memberPackage.setValidDays((Integer) card.get("validity_days"));
                } else if (card.containsKey("valid_days")) {
                    memberPackage.setValidDays((Integer) card.get("valid_days"));
                }
                
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
                importedCount++;
                
                System.out.println("导入套餐: " + name + " (code: " + code + ")");
            } else {
                System.out.println("跳过已存在的套餐: " + code);
            }
        }

        System.out.println("数据导入完成，共导入 " + importedCount + " 条新数据");
    }
}