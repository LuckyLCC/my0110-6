package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUsername(String username);
}

