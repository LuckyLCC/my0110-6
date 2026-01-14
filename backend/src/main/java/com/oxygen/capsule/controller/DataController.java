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
        try {
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
                try {
                    String code = (String) card.get("code");
                    
                    if (code == null || code.isEmpty()) {
                        continue;
                    }
                    
                    // 检查套餐是否已存在
                    MemberPackage existingPackage = memberPackageService.findByCode(code);
                    if (existingPackage != null) {
                        continue;
                    }
                    
                    MemberPackage memberPackage = new MemberPackage();
                    memberPackage.setCode(code);
                    
                    // 设置名称
                    String name = (String) card.get("name");
                    if (name == null || name.isEmpty()) {
                        continue;
                    }
                    memberPackage.setName(name);
                    
                    // 安全地转换价格（必填字段）
                    Object priceObj = card.get("price");
                    if (priceObj != null) {
                        if (priceObj instanceof Integer) {
                            memberPackage.setPrice(Double.valueOf((Integer) priceObj));
                        } else if (priceObj instanceof Double) {
                            memberPackage.setPrice((Double) priceObj);
                        } else if (priceObj instanceof Number) {
                            memberPackage.setPrice(((Number) priceObj).doubleValue());
                        }
                    } else {
                        continue; // 价格是必填字段
                    }
                    
                    // 安全地转换people（必填字段）
                    Object peopleObj = card.get("people");
                    if (peopleObj != null) {
                        if (peopleObj instanceof Integer) {
                            memberPackage.setPeople((Integer) peopleObj);
                        } else if (peopleObj instanceof Number) {
                            memberPackage.setPeople(((Number) peopleObj).intValue());
                        }
                    } else {
                        memberPackage.setPeople(1); // 默认值
                    }
                    
                    // 安全地转换valid_days（必填字段）
                    Object validDaysObj = card.get("valid_days");
                    if (validDaysObj != null) {
                        if (validDaysObj instanceof Integer) {
                            memberPackage.setValidDays((Integer) validDaysObj);
                        } else if (validDaysObj instanceof Number) {
                            memberPackage.setValidDays(((Number) validDaysObj).intValue());
                        } else {
                            // 如果类型不匹配，根据名称判断或使用默认值
                            if (name.contains("次卡")) {
                                memberPackage.setValidDays(-1);
                            } else {
                                memberPackage.setValidDays(30);
                            }
                        }
                    } else {
                        // 如果没有valid_days字段，根据名称判断或使用默认值
                        if (name.contains("次卡")) {
                            memberPackage.setValidDays(-1);
                        } else {
                            memberPackage.setValidDays(30);
                        }
                    }
                    
                    // avg_price_per_time 可能不存在
                    if (card.containsKey("avg_price_per_time")) {
                        Object avgPriceObj = card.get("avg_price_per_time");
                        if (avgPriceObj instanceof Integer) {
                            memberPackage.setAvgPricePerTime(Double.valueOf((Integer) avgPriceObj));
                        } else if (avgPriceObj instanceof Double) {
                            memberPackage.setAvgPricePerTime((Double) avgPriceObj);
                        } else if (avgPriceObj instanceof Number) {
                            memberPackage.setAvgPricePerTime(((Number) avgPriceObj).doubleValue());
                        }
                    }
                    
                    // times_per_person 可能不存在
                    if (card.containsKey("times_per_person")) {
                        Object timesObj = card.get("times_per_person");
                        if (timesObj instanceof Integer) {
                            memberPackage.setTimesPerPerson((Integer) timesObj);
                        } else if (timesObj instanceof Number) {
                            memberPackage.setTimesPerPerson(((Number) timesObj).intValue());
                        }
                    }
                    
                    // 设置分类
                    if (name.contains("人") && !name.contains("1人")) {
                        memberPackage.setCategory("多人尊享");
                    } else if (name.contains("次卡")) {
                        memberPackage.setCategory("家庭/次卡");
                    } else {
                        memberPackage.setCategory("个人畅享");
                    }
                    
                    memberPackage.setIsActive(true);
                    memberPackage.setSortOrder(0);
                    
                    // 验证必填字段
                    if (memberPackage.getValidDays() == null) {
                        continue; // 跳过validDays为null的记录
                    }
                    
                    memberPackageService.save(memberPackage);
                    importedCount++;
                } catch (Exception e) {
                    // 单个卡片处理失败，记录日志但继续处理其他卡片
                    System.err.println("处理卡片时出错: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            return Result.success("套餐数据初始化成功，导入 " + importedCount + " 条新数据");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("初始化套餐数据失败: " + e.getMessage());
        }
    }
}