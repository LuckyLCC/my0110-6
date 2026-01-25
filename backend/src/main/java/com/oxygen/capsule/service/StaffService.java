package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.Staff;
import java.util.List;
import java.util.Optional;

public interface StaffService {
    Staff findByUsername(String username);
    Staff save(Staff staff);
    Optional<Staff> findById(Long id);
    List<Staff> findActiveStaffs();
}

