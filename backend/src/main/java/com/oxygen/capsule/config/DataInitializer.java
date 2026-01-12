package com.oxygen.capsule.config;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.service.MemberPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

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

        // 个人畅享 - 月卡
        MemberPackage monthCard = new MemberPackage();
        monthCard.setName("个人月卡");
        monthCard.setDescription("尊享30天无限次纯净体验");
        monthCard.setPrice(1680.0);
        monthCard.setOriginalPrice(2980.0);
        monthCard.setValidityDays(30);
        monthCard.setVisitCount(-1); // 无限次
        monthCard.setBindLimit(1);
        monthCard.setBadge("新人推荐");
        monthCard.setPerTimePrice("约 ¥56/次");
        monthCard.setCategory("个人畅享");
        monthCard.setFeatures("有效期30天,无限次,支持1人绑定");
        memberPackageService.save(monthCard);

        // 个人畅享 - 年卡
        MemberPackage yearCard = new MemberPackage();
        yearCard.setName("个人年卡");
        yearCard.setDescription("尊享365天无限次纯净体验");
        yearCard.setPrice(9800.0);
        yearCard.setOriginalPrice(15800.0);
        yearCard.setValidityDays(365);
        yearCard.setVisitCount(-1); // 无限次
        yearCard.setBindLimit(1);
        yearCard.setBadge("超值");
        yearCard.setPerTimePrice("约 ¥27/次");
        yearCard.setCategory("个人畅享");
        yearCard.setFeatures("有效期365天,无限次,支持1人绑定");
        memberPackageService.save(yearCard);

        // 个人畅享 - 季卡
        MemberPackage seasonCard = new MemberPackage();
        seasonCard.setName("个人季卡");
        seasonCard.setDescription("尊享90天无限次纯净体验");
        seasonCard.setPrice(3680.0);
        seasonCard.setOriginalPrice(5800.0);
        seasonCard.setValidityDays(90);
        seasonCard.setVisitCount(-1); // 无限次
        seasonCard.setBindLimit(1);
        seasonCard.setCategory("个人畅享");
        seasonCard.setFeatures("有效期90天,无限次,支持1人绑定");
        memberPackageService.save(seasonCard);

        // 个人畅享 - 半年卡
        MemberPackage halfYearCard = new MemberPackage();
        halfYearCard.setName("个人半年卡");
        halfYearCard.setDescription("尊享180天无限次纯净体验");
        halfYearCard.setPrice(5800.0);
        halfYearCard.setOriginalPrice(9800.0);
        halfYearCard.setValidityDays(180);
        halfYearCard.setVisitCount(-1); // 无限次
        halfYearCard.setBindLimit(1);
        halfYearCard.setCategory("个人畅享");
        halfYearCard.setFeatures("有效期180天,无限次,支持1人绑定");
        memberPackageService.save(halfYearCard);

        // 多人尊享 - 双人季卡
        MemberPackage coupleSeasonCard = new MemberPackage();
        coupleSeasonCard.setName("双人季卡");
        coupleSeasonCard.setDescription("尊享90天无限次纯净体验（支持2人绑定）");
        coupleSeasonCard.setPrice(5800.0);
        coupleSeasonCard.setOriginalPrice(8800.0);
        coupleSeasonCard.setValidityDays(90);
        coupleSeasonCard.setVisitCount(-1); // 无限次
        coupleSeasonCard.setBindLimit(2);
        coupleSeasonCard.setBadge("超值");
        coupleSeasonCard.setPerTimePrice("约 ¥64/次");
        coupleSeasonCard.setCategory("多人尊享");
        coupleSeasonCard.setFeatures("有效期90天,无限次,支持2人绑定");
        memberPackageService.save(coupleSeasonCard);

        // 多人尊享 - 家庭年卡
        MemberPackage familyYearCard = new MemberPackage();
        familyYearCard.setName("家庭年卡");
        familyYearCard.setDescription("尊享365天无限次纯净体验（支持4人绑定）");
        familyYearCard.setPrice(15800.0);
        familyYearCard.setOriginalPrice(23800.0);
        familyYearCard.setValidityDays(365);
        familyYearCard.setVisitCount(-1); // 无限次
        familyYearCard.setBindLimit(4);
        familyYearCard.setCategory("多人尊享");
        familyYearCard.setFeatures("有效期365天,无限次,支持4人绑定");
        memberPackageService.save(familyYearCard);

        // 家庭/次卡 - 10次卡
        MemberPackage tenTimesCard = new MemberPackage();
        tenTimesCard.setName("10次卡");
        tenTimesCard.setDescription("10次纯净氧舱体验");
        tenTimesCard.setPrice(2980.0);
        tenTimesCard.setOriginalPrice(3980.0);
        tenTimesCard.setValidityDays(180); // 180天内有效
        tenTimesCard.setVisitCount(10);
        tenTimesCard.setBindLimit(1);
        tenTimesCard.setBadge("新人推荐");
        tenTimesCard.setPerTimePrice("约 ¥298/次");
        tenTimesCard.setCategory("家庭/次卡");
        tenTimesCard.setFeatures("10次体验,180天有效期,支持1人绑定");
        memberPackageService.save(tenTimesCard);

        // 家庭/次卡 - 20次卡
        MemberPackage twentyTimesCard = new MemberPackage();
        twentyTimesCard.setName("20次卡");
        twentyTimesCard.setDescription("20次纯净氧舱体验");
        twentyTimesCard.setPrice(4980.0);
        twentyTimesCard.setOriginalPrice(7960.0);
        twentyTimesCard.setValidityDays(365); // 365天内有效
        twentyTimesCard.setVisitCount(20);
        twentyTimesCard.setBindLimit(1);
        twentyTimesCard.setCategory("家庭/次卡");
        twentyTimesCard.setFeatures("20次体验,365天有效期,支持1人绑定");
        memberPackageService.save(twentyTimesCard);
    }
}