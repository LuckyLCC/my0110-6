package com.oxygen.capsule.controller;

import com.oxygen.capsule.common.Result;
import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.service.MemberPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class MemberPackageController {

    @Autowired
    private MemberPackageService memberPackageService;

    // 获取所有会员套餐
    @GetMapping("/all")
    public Result<List<MemberPackage>> getAllPackages() {
        List<MemberPackage> packages = memberPackageService.findAll();
        return Result.success(packages);
    }

    // 根据分类获取会员套餐
    @GetMapping("/category/{category}")
    public Result<List<MemberPackage>> getPackagesByCategory(@PathVariable String category) {
        List<MemberPackage> packages = memberPackageService.findByCategory(category);
        return Result.success(packages);
    }

    // 获取单个会员套餐详情
    @GetMapping("/{id}")
    public Result<MemberPackage> getPackageById(@PathVariable Long id) {
        MemberPackage pkg = memberPackageService.findById(id);
        if (pkg == null) {
            return Result.error("套餐不存在");
        }
        return Result.success(pkg);
    }
}