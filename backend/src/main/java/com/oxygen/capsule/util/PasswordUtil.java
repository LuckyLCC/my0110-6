package com.oxygen.capsule.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtil {
    
    /**
     * 使用SHA-256加密密码
     */
    public static String encryptPassword(String password) {
        if (password == null || password.isEmpty()) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("密码加密失败", e);
        }
    }
    
    /**
     * 验证密码
     */
    public static boolean verifyPassword(String password, String hashedPassword) {
        if (password == null || hashedPassword == null) {
            return false;
        }
        String encrypted = encryptPassword(password);
        return encrypted.equals(hashedPassword);
    }
}

