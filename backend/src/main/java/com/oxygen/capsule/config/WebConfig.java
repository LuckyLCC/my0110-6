package com.oxygen.capsule.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")  // 在生产环境中应该指定具体的域名
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")  // 添加PATCH方法支持
                .allowedHeaders("*")
                .allowCredentials(false)  // 如果需要携带cookie，则设置为true
                .maxAge(3600);
    }
}