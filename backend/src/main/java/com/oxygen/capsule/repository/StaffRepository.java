package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.Staff;
import com.oxygen.capsule.entity.enums.StaffsStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUsername(String username);
    List<Staff> findByStatus(StaffsStatusEnum status);
}

