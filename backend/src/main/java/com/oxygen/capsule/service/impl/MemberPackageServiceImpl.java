package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.repository.MemberPackageRepository;
import com.oxygen.capsule.service.MemberPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberPackageServiceImpl implements MemberPackageService {

    @Autowired
    private MemberPackageRepository memberPackageRepository;

    @Override
    public List<MemberPackage> findAllByCategory(String category) {
        return memberPackageRepository.findAllByCategoryAndIsActiveTrueOrderBySortOrderAsc(category);
    }

    @Override
    public List<MemberPackage> findAll() {
        return memberPackageRepository.findAllByIsActiveTrueOrderBySortOrderAsc();
    }

    @Override
    public MemberPackage findById(Long id) {
        return memberPackageRepository.findById(id).orElse(null);
    }

    @Override
    public MemberPackage save(MemberPackage memberPackage) {
        return memberPackageRepository.save(memberPackage);
    }

    @Override
    public List<MemberPackage> findByCategory(String category) {
        return memberPackageRepository.findAllByCategoryAndIsActiveTrueOrderBySortOrderAsc(category);
    }
}