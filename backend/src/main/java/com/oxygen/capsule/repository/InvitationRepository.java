package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.Invitation;
import com.oxygen.capsule.entity.enums.InvitationsStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    // 根据邀请码查找
    Optional<Invitation> findByInviteCode(String inviteCode);
    
    // 根据邀请人ID查找所有邀请记录
    List<Invitation> findByInviterIdOrderByCreatedAtDesc(Long inviterId);
    
    // 根据被邀请人ID查找
    List<Invitation> findByInviteeIdOrderByCreatedAtDesc(Long inviteeId);
    
    // 根据支付订单ID查找
    List<Invitation> findByPaymentOrderId(Long paymentOrderId);
    
    // 根据支付订单ID和状态查找
    List<Invitation> findByPaymentOrderIdAndStatus(Long paymentOrderId, InvitationsStatusEnum status);
    
    // 根据被邀请人ID和支付订单ID查找
    List<Invitation> findByInviteeIdAndPaymentOrderId(Long inviteeId, Long paymentOrderId);
}

