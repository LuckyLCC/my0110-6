package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.User;
import java.util.Optional;

public interface UserService {
    User findByOpenid(String openid);
    User save(User user);
    User updateUserInfo(Long userId, String nickname, String avatarUrl);
    User bindPhone(Long userId, String phone);
    Optional<User> findById(Long id);
}