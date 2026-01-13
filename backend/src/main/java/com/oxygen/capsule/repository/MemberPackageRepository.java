package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.MemberPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberPackageRepository extends JpaRepository<MemberPackage, Long> {
    List<MemberPackage> findAllByCategoryAndIsActiveTrueOrderBySortOrderAsc(String category);
    List<MemberPackage> findAllByIsActiveTrueOrderBySortOrderAsc();
    MemberPackage findByCode(String code);
    List<MemberPackage> findAllByCategory(String category);
}