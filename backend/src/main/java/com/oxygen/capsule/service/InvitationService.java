package com.oxygen.capsule.service;

import com.oxygen.capsule.entity.Invitation;
import java.util.List;
import java.util.Map;

public interface InvitationService {
    // 生成邀请码
    Invitation generateInviteCode(Long userId, Long paymentOrderId);
    
    // 接受邀请（通过用户ID）
    Map<String, Object> acceptInvitation(String inviteCode, Long inviteeId);
    
    // 接受邀请（通过微信code，如果用户不存在则创建）
    Map<String, Object> acceptInvitationByCode(String inviteCode, String wechatCode);
    
    // 获取用户的邀请列表
    List<Invitation> getInvitationsByInviter(Long inviterId);
    
    // 根据邀请码查找邀请
    Invitation findByInviteCode(String inviteCode);
    
    // 检查是否可以生成邀请（检查绑定人数限制）
    boolean canGenerateInvite(Long paymentOrderId);
}

