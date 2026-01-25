package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.Staff;
import com.oxygen.capsule.entity.enums.StaffsStatusEnum;
import com.oxygen.capsule.repository.StaffRepository;
import com.oxygen.capsule.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public Staff findByUsername(String username) {
        return staffRepository.findByUsername(username);
    }

    @Override
    public Staff save(Staff staff) {
        return staffRepository.save(staff);
    }

    @Override
    public Optional<Staff> findById(Long id) {
        return staffRepository.findById(id);
    }

    @Override
    public List<Staff> findActiveStaffs() {
        return staffRepository.findByStatus(StaffsStatusEnum.ACTIVE);
    }
}

