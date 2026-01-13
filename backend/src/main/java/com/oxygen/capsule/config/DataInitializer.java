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
        // 检查是否已有数据，如果有则不再初始化
        if (!memberPackageService.findAll().isEmpty()) {
            return;
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
        } catch (Exception e) {
            // 如果JSON文件不存在或解析失败，则使用默认数据
            createDefaultPackages();
        }
    }

    private void createDefaultPackages() {
        // 个人畅享 - 月卡
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

        // 个人畅享 - 季卡
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

        // 个人畅享 - 半年卡
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

        // 个人畅享 - 年卡
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

        // 多人尊享 - 2人半年卡
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

        // 多人尊享 - 2人年卡
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

        // 家庭/次卡 - 家庭100次卡
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

        // 家庭/次卡 - 家庭200次卡
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
    }
}