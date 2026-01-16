package com.oxygen.capsule.service.impl;

import com.oxygen.capsule.entity.Invitation;
import com.oxygen.capsule.entity.MemberPackage;
import com.oxygen.capsule.entity.PaymentOrder;
import com.oxygen.capsule.entity.User;
import com.oxygen.capsule.repository.InvitationRepository;
import com.oxygen.capsule.service.InvitationService;
import com.oxygen.capsule.service.MemberPackageService;
import com.oxygen.capsule.service.PaymentService;
import com.oxygen.capsule.service.UserService;
import com.oxygen.capsule.util.WechatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class InvitationServiceImpl implements InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MemberPackageService memberPackageService;

    @Autowired
    private UserService userService;

    @Autowired
    private WechatUtil wechatUtil;

    @Override
    public Invitation generateInviteCode(Long userId, Long paymentOrderId) {
        // 检查是否可以生成邀请
        if (!canGenerateInvite(paymentOrderId)) {
            throw new RuntimeException("已达到最大绑定人数限制，无法生成邀请码");
        }

        // 生成唯一的邀请码（8位数字+字母）
        String inviteCode = generateUniqueInviteCode();

        // 创建邀请记录
        Invitation invitation = new Invitation();
        invitation.setInviterId(userId);
        invitation.setPaymentOrderId(paymentOrderId);
        invitation.setInviteCode(inviteCode);
        invitation.setStatus("pending");
        invitation.setExpiredAt(LocalDateTime.now().plusDays(30)); // 30天后过期

        return invitationRepository.save(invitation);
    }

    @Override
    public Map<String, Object> acceptInvitation(String inviteCode, Long inviteeId) {
        // 查找邀请记录
        Invitation invitation = invitationRepository.findByInviteCode(inviteCode)
            .orElseThrow(() -> new RuntimeException("邀请码不存在"));

        // 检查邀请状态
        if ("accepted".equals(invitation.getStatus())) {
            throw new RuntimeException("该邀请码已被使用");
        }

        if ("expired".equals(invitation.getStatus())) {
            throw new RuntimeException("该邀请码已过期");
        }

        if (invitation.getExpiredAt() != null && LocalDateTime.now().isAfter(invitation.getExpiredAt())) {
            invitation.setStatus("expired");
            invitationRepository.save(invitation);
            throw new RuntimeException("该邀请码已过期");
        }

        // 检查被邀请人是否已经绑定过该订单
        List<Invitation> existingInvitations = invitationRepository.findByInviteeIdAndPaymentOrderId(
            inviteeId, invitation.getPaymentOrderId());
        if (!existingInvitations.isEmpty()) {
            throw new RuntimeException("您已经绑定过该会员卡");
        }

        // 检查是否可以接受邀请（检查绑定人数限制）
        if (!canGenerateInvite(invitation.getPaymentOrderId())) {
            throw new RuntimeException("该会员卡已达到最大绑定人数限制");
        }

        // 更新邀请记录
        invitation.setInviteeId(inviteeId);
        invitation.setStatus("accepted");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("invitation", invitation);
        result.put("message", "绑定成功");

        return result;
    }

    @Override
    public Map<String, Object> acceptInvitationByCode(String inviteCode, String wechatCode) {
        // 通过微信 code 获取 openid
        Map<String, String> wxResult = wechatUtil.getOpenidAndSessionKey(wechatCode);
        String openid = wxResult.get("openid");
        
        if (openid == null || openid.isEmpty()) {
            throw new RuntimeException("微信登录失败: 未获取到openid");
        }
        
        // 查找或创建用户
        User user = userService.findByOpenid(openid);
        if (user == null) {
            // 创建新用户
            user = new User();
            user.setOpenid(openid);
            user.setNickname("微信用户" + System.currentTimeMillis());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user = userService.save(user);
        }
        
        // 更新用户登录时间
        user.setLastLoginTime(LocalDateTime.now());
        user = userService.save(user);
        
        // 使用用户ID接受邀请
        Map<String, Object> result = acceptInvitation(inviteCode, user.getId());
        // 添加 openid 到结果中，用于前端生成 token
        result.put("openid", openid);
        return result;
    }

    @Override
    public List<Invitation> getInvitationsByInviter(Long inviterId) {
        return invitationRepository.findByInviterIdOrderByCreatedAtDesc(inviterId);
    }

    @Override
    public Invitation findByInviteCode(String inviteCode) {
        return invitationRepository.findByInviteCode(inviteCode)
            .orElse(null);
    }

    @Override
    public boolean canGenerateInvite(Long paymentOrderId) {
        // 获取支付订单
        PaymentOrder paymentOrder = paymentService.findById(paymentOrderId);
        if (paymentOrder == null) {
            return false;
        }

        // 获取套餐信息
        MemberPackage memberPackage = memberPackageService.findById(paymentOrder.getPackageId());
        if (memberPackage == null) {
            return false;
        }

        // 获取套餐支持的人数
        Integer maxPeople = memberPackage.getPeople();
        if (maxPeople == null || maxPeople <= 0) {
            return false; // 如果没有人数限制或为0，不允许邀请
        }

        // 如果 maxPeople 为 -1，表示不限制人数
        if (maxPeople == -1) {
            return true;
        }

        // 统计已接受的邀请数量（包括邀请人自己）
        List<Invitation> acceptedInvitations = invitationRepository.findByPaymentOrderIdAndStatus(
            paymentOrderId, "accepted");
        int boundCount = acceptedInvitations.size() + 1; // +1 是邀请人自己

        // 检查是否达到人数限制
        return boundCount < maxPeople;
    }

    // 生成唯一的邀请码（8位：4位数字 + 4位字母）
    private String generateUniqueInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除容易混淆的字符
        Random random = new Random();
        String code;
        int maxAttempts = 10;
        int attempts = 0;

        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
            attempts++;
        } while (invitationRepository.findByInviteCode(code).isPresent() && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // 如果10次都重复，使用时间戳+随机数
            code = "INV" + System.currentTimeMillis() % 10000000;
        }

        return code;
    }
}

