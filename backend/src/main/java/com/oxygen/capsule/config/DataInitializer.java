package com.oxygen.capsule.config;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.service.MemberPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MemberPackageService memberPackageService;

    @Override
    public void run(String... args) throws Exception {
        // 初始化默认的会员套餐数据
        initializeMemberPackages();
    }

    private void initializeMemberPackages() {
        try {
            // 读取JSON文件
            ClassPathResource resource = new ClassPathResource("氧舱会员卡价格表（简洁完整版）.json");
            InputStream inputStream = resource.getInputStream();
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 解析JSON
            Map<String, Object> jsonMap = objectMapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> cards = (List<Map<String, Object>>) jsonMap.get("cards");

            if (cards == null || cards.isEmpty()) {
                // JSON文件存在但cards为空，使用默认数据
                System.out.println("JSON文件中的cards为空，使用默认数据");
                createDefaultPackages();
                return;
            }

            // 遍历并创建会员套餐
            for (Map<String, Object> card : cards) {
                try {
                    String code = (String) card.get("code");
                    
                    if (code == null || code.isEmpty()) {
                        System.out.println("跳过code为空的卡片");
                        continue;
                    }
                    
                    // 检查套餐是否已存在
                    MemberPackage existingPackage = memberPackageService.findByCode(code);
                    if (existingPackage != null) {
                        System.out.println("套餐已存在，跳过: " + code);
                        continue;
                    }
                    
                    MemberPackage memberPackage = new MemberPackage();
                    memberPackage.setCode(code);
                    
                    // 设置名称
                    String name = (String) card.get("name");
                    if (name == null || name.isEmpty()) {
                        System.out.println("跳过name为空的卡片: " + code);
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
                        System.out.println("跳过price为空的卡片: " + code);
                        continue;
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
                        // 如果没有people字段，默认为1
                        memberPackage.setPeople(1);
                        System.out.println("卡片 " + code + " 缺少people字段，使用默认值1");
                    }
                    
                    // 安全地转换valid_days（必填字段）
                    Object validDaysObj = card.get("valid_days");
                    if (validDaysObj != null) {
                        if (validDaysObj instanceof Integer) {
                            memberPackage.setValidDays((Integer) validDaysObj);
                        } else if (validDaysObj instanceof Number) {
                            memberPackage.setValidDays(((Number) validDaysObj).intValue());
                        } else {
                            // 如果类型不匹配，使用默认值
                            memberPackage.setValidDays(30);
                            System.out.println("卡片 " + code + " 的valid_days类型不匹配，使用默认值30");
                        }
                    } else {
                        // 如果没有valid_days字段，根据名称判断或使用默认值
                        // 次卡通常没有有效期限制，使用-1
                        if (name != null && name.contains("次卡")) {
                            memberPackage.setValidDays(-1);
                            System.out.println("卡片 " + code + " 缺少valid_days字段，根据名称判断为次卡，设置为-1（无限制）");
                        } else {
                            // 其他情况使用默认值30天
                            memberPackage.setValidDays(30);
                            System.out.println("卡片 " + code + " 缺少valid_days字段，使用默认值30");
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
                    
                    // 设置分类（name已经在前面检查过，不会为null）
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
                    if (memberPackage.getCode() == null || memberPackage.getCode().isEmpty()) {
                        System.out.println("跳过code为空的套餐");
                        continue;
                    }
                    if (memberPackage.getName() == null || memberPackage.getName().isEmpty()) {
                        System.out.println("跳过name为空的套餐: " + code);
                        continue;
                    }
                    if (memberPackage.getPrice() == null) {
                        System.out.println("跳过price为空的套餐: " + code);
                        continue;
                    }
                    if (memberPackage.getPeople() == null) {
                        System.out.println("跳过people为空的套餐: " + code);
                        continue;
                    }
                    if (memberPackage.getValidDays() == null) {
                        System.out.println("跳过validDays为空的套餐: " + code);
                        continue;
                    }
                    
                    memberPackageService.save(memberPackage);
                    System.out.println("成功创建套餐: " + code);
                } catch (Exception e) {
                    // 单个卡片处理失败，记录日志但继续处理其他卡片
                    System.err.println("处理卡片时出错: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (java.io.FileNotFoundException e) {
            // JSON文件不存在，使用默认数据
            System.out.println("JSON文件不存在，使用默认数据");
            createDefaultPackages();
        } catch (Exception e) {
            // 其他异常（如JSON解析失败），使用默认数据
            System.err.println("读取JSON文件失败: " + e.getMessage());
            e.printStackTrace();
            System.out.println("使用默认数据");
            createDefaultPackages();
        }
    }

    private void createDefaultPackages() {
        // 个人畅享 - 月卡
        if (memberPackageService.findByCode("MONTHLY") == null) {
            MemberPackage monthCard = new MemberPackage();
            monthCard.setCode("MONTHLY");
            monthCard.setName("月卡");
            monthCard.setPrice(3980.0);
            monthCard.setPeople(1);
            monthCard.setValidDays(30);
            monthCard.setAvgPricePerTime(159.0);
            monthCard.setCategory("个人畅享");
            monthCard.setFeatures("有效期30天,25次体验,支持1人使用");
            memberPackageService.save(monthCard);
            System.out.println("创建默认套餐: MONTHLY");
        }

        // 个人畅享 - 季卡
        if (memberPackageService.findByCode("QUARTERLY") == null) {
            MemberPackage seasonCard = new MemberPackage();
            seasonCard.setCode("QUARTERLY");
            seasonCard.setName("季卡");
            seasonCard.setPrice(10800.0);
            seasonCard.setPeople(1);
            seasonCard.setValidDays(90);
            seasonCard.setAvgPricePerTime(144.0);
            seasonCard.setCategory("个人畅享");
            seasonCard.setFeatures("有效期90天,75次体验,支持1人使用");
            memberPackageService.save(seasonCard);
            System.out.println("创建默认套餐: QUARTERLY");
        }

        // 个人畅享 - 半年卡
        if (memberPackageService.findByCode("HALF_YEAR") == null) {
            MemberPackage halfYearCard = new MemberPackage();
            halfYearCard.setCode("HALF_YEAR");
            halfYearCard.setName("半年卡");
            halfYearCard.setPrice(19800.0);
            halfYearCard.setPeople(1);
            halfYearCard.setValidDays(180);
            halfYearCard.setAvgPricePerTime(132.0);
            halfYearCard.setCategory("个人畅享");
            halfYearCard.setFeatures("有效期180天,150次体验,支持1人使用");
            memberPackageService.save(halfYearCard);
            System.out.println("创建默认套餐: HALF_YEAR");
        }

        // 个人畅享 - 年卡
        if (memberPackageService.findByCode("YEARLY") == null) {
            MemberPackage yearCard = new MemberPackage();
            yearCard.setCode("YEARLY");
            yearCard.setName("年卡");
            yearCard.setPrice(29800.0);
            yearCard.setPeople(1);
            yearCard.setValidDays(365);
            yearCard.setAvgPricePerTime(99.0);
            yearCard.setCategory("个人畅享");
            yearCard.setFeatures("有效期365天,300次体验,支持1人使用");
            memberPackageService.save(yearCard);
            System.out.println("创建默认套餐: YEARLY");
        }

        // 多人尊享 - 2人半年卡
        if (memberPackageService.findByCode("TWO_PEOPLE_HALF_YEAR") == null) {
            MemberPackage twoPeopleHalfYearCard = new MemberPackage();
            twoPeopleHalfYearCard.setCode("TWO_PEOPLE_HALF_YEAR");
            twoPeopleHalfYearCard.setName("2人半年卡");
            twoPeopleHalfYearCard.setPrice(23800.0);
            twoPeopleHalfYearCard.setPeople(2);
            twoPeopleHalfYearCard.setValidDays(180);
            twoPeopleHalfYearCard.setTimesPerPerson(150);
            twoPeopleHalfYearCard.setAvgPricePerTime(79.0);
            twoPeopleHalfYearCard.setCategory("多人尊享");
            twoPeopleHalfYearCard.setFeatures("有效期180天,300次体验,支持2人使用");
            memberPackageService.save(twoPeopleHalfYearCard);
            System.out.println("创建默认套餐: TWO_PEOPLE_HALF_YEAR");
        }

        // 多人尊享 - 2人年卡
        if (memberPackageService.findByCode("TWO_PEOPLE_YEAR") == null) {
            MemberPackage twoPeopleYearCard = new MemberPackage();
            twoPeopleYearCard.setCode("TWO_PEOPLE_YEAR");
            twoPeopleYearCard.setName("2人年卡");
            twoPeopleYearCard.setPrice(39800.0);
            twoPeopleYearCard.setPeople(2);
            twoPeopleYearCard.setValidDays(365);
            twoPeopleYearCard.setTimesPerPerson(300);
            twoPeopleYearCard.setAvgPricePerTime(66.0);
            twoPeopleYearCard.setCategory("多人尊享");
            twoPeopleYearCard.setFeatures("有效期365天,600次体验,支持2人使用");
            memberPackageService.save(twoPeopleYearCard);
            System.out.println("创建默认套餐: TWO_PEOPLE_YEAR");
        }

        // 家庭/次卡 - 家庭100次卡
        if (memberPackageService.findByCode("FAMILY_100") == null) {
            MemberPackage family100Card = new MemberPackage();
            family100Card.setCode("FAMILY_100");
            family100Card.setName("家庭100次卡");
            family100Card.setPrice(19800.0);
            family100Card.setPeople(-1); // -1表示无限制
            family100Card.setValidDays(-1); // -1表示无限制
            family100Card.setAvgPricePerTime(198.0);
            family100Card.setCategory("家庭/次卡");
            family100Card.setFeatures("100次体验,无时间限制,多人共享");
            memberPackageService.save(family100Card);
            System.out.println("创建默认套餐: FAMILY_100");
        }

        // 家庭/次卡 - 家庭200次卡
        if (memberPackageService.findByCode("FAMILY_200") == null) {
            MemberPackage family200Card = new MemberPackage();
            family200Card.setCode("FAMILY_200");
            family200Card.setName("家庭200次卡");
            family200Card.setPrice(36800.0);
            family200Card.setPeople(-1); // -1表示无限制
            family200Card.setValidDays(-1); // -1表示无限制
            family200Card.setAvgPricePerTime(184.0);
            family200Card.setCategory("家庭/次卡");
            family200Card.setFeatures("200次体验,无时间限制,多人共享");
            memberPackageService.save(family200Card);
            System.out.println("创建默认套餐: FAMILY_200");
        }
    }
}