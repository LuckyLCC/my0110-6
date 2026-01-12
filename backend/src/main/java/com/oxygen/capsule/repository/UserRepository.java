package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByOpenid(String openid);
}