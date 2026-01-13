package com.oxygen.capsule.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.oxygen.capsule.config.WechatConfig;

import java.util.HashMap;
import java.util.Map;

@Component
public class WechatUtil {

    private static final Logger logger = LoggerFactory.getLogger(WechatUtil.class);

    @Autowired
    private WechatConfig wechatConfig;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 通过微信code换取openid和session_key
     *
     * @param code 微信登录凭证
     * @return 包含openid和session_key的Map
     */
    public Map<String, String> getOpenidAndSessionKey(String code) {
        logger.debug("开始调用微信登录API，code长度: {}", code != null ? code.length() : 0);
        
        // 检查配置
        if (wechatConfig == null) {
            logger.error("WechatConfig 未注入");
            throw new RuntimeException("微信配置未初始化");
        }
        
        String appid = wechatConfig.getAppid();
        String secret = wechatConfig.getSecret();
        
        logger.debug("AppID: {}, Secret长度: {}", appid, secret != null ? secret.length() : 0);
        
        if (appid == null || appid.isEmpty()) {
            logger.error("微信AppID未配置");
            throw new RuntimeException("微信AppID未配置");
        }
        if (secret == null || secret.isEmpty()) {
            logger.error("微信AppSecret未配置");
            throw new RuntimeException("微信AppSecret未配置");
        }
        if (code == null || code.isEmpty()) {
            logger.error("微信登录code为空");
            throw new RuntimeException("微信登录code不能为空");
        }

        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                appid, secret, code
        );

        logger.debug("请求微信API: {}", url.replace(secret, "***"));

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();
            
            logger.debug("微信API响应状态: {}, 响应体: {}", response.getStatusCode(), responseBody);
            
            if (responseBody == null || responseBody.isEmpty()) {
                logger.error("微信API返回空响应");
                throw new RuntimeException("微信API返回空响应");
            }

            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // 先检查是否有错误码
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.has("errmsg") ? jsonNode.get("errmsg").asText() : "未知错误";
                
                logger.error("微信API返回错误: errcode={}, errmsg={}", errcode, errmsg);
                
                // 常见错误码说明
                String errorDetail = getErrorDescription(errcode);
                String errorMessage = "微信登录API错误: " + errmsg + " (errcode: " + errcode + ")" + 
                    (errorDetail != null ? " - " + errorDetail : "");
                throw new RuntimeException(errorMessage);
            }

            // 检查是否有openid
            if (!jsonNode.has("openid") || jsonNode.get("openid").isNull()) {
                throw new RuntimeException("微信API未返回openid，响应: " + responseBody);
            }

            String openid = jsonNode.get("openid").asText();
            if (openid == null || openid.isEmpty()) {
                throw new RuntimeException("微信API返回的openid为空");
            }

            String sessionKey = jsonNode.has("session_key") && !jsonNode.get("session_key").isNull() 
                ? jsonNode.get("session_key").asText() : null;
            String unionid = jsonNode.has("unionid") && !jsonNode.get("unionid").isNull() 
                ? jsonNode.get("unionid").asText() : null;

            Map<String, String> result = new HashMap<>();
            result.put("openid", openid);
            if (sessionKey != null) {
                result.put("session_key", sessionKey);
            }
            if (unionid != null) {
                result.put("unionid", unionid);
            }

            return result;
        } catch (RuntimeException e) {
            // 重新抛出业务异常
            throw e;
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            throw new RuntimeException("调用微信登录API失败: " + errorMsg, e);
        }
    }

    /**
     * 获取微信错误码说明
     */
    private String getErrorDescription(int errcode) {
        switch (errcode) {
            case 40013:
                return "AppID无效，请检查配置";
            case 40125:
                return "AppSecret无效，请检查配置";
            case 40029:
                return "code无效或已过期（code只能使用一次，有效期5分钟）";
            case 45011:
                return "API调用太频繁，请稍后再试";
            case -1:
                return "系统繁忙，请稍后再试";
            default:
                return null;
        }
    }
}