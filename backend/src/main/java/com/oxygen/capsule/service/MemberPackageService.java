package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.MemberPackage;
import java.util.List;

public interface MemberPackageService {
    List<MemberPackage> findAllByCategory(String category);
    List<MemberPackage> findAll();
    MemberPackage findById(Long id);
    MemberPackage save(MemberPackage memberPackage);
    List<MemberPackage> findByCategory(String category);
}