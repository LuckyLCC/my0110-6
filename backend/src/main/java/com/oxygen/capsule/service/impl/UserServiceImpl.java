package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.repository.UserRepository;
import com.oxygen.capsule.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findByOpenid(String openid) {
        return userRepository.findByOpenid(openid);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public User updateUserInfo(Long userId, String nickname, String avatarUrl) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (nickname != null) {
                user.setNickname(nickname);
            }
            if (avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
            }
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    @Override
    public User bindPhone(Long userId, String phone) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setPhone(phone);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}