-- 城市森林氧舱小程序数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '手机号',
    member_level INT DEFAULT 0 COMMENT '会员等级: 0-普通用户, 1-会员',
    member_expire_time DATETIME COMMENT '会员到期时间',
    total_visits INT DEFAULT 0 COMMENT '总访问次数',
    remaining_visits INT DEFAULT 0 COMMENT '剩余访问次数',
    points INT DEFAULT 0 COMMENT '积分',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 会员套餐表
CREATE TABLE IF NOT EXISTS member_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    description TEXT COMMENT '套餐描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    validity_days INT NOT NULL COMMENT '有效期天数',
    bind_limit INT DEFAULT 1 COMMENT '绑定限制',
    badge VARCHAR(50) COMMENT '徽章/标签',
    per_time_price VARCHAR(50) COMMENT '单次价格描述',
    category VARCHAR(50) NOT NULL COMMENT '分类',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    features TEXT COMMENT '功能特性(逗号分隔)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员套餐表';

-- 预约订单表
CREATE TABLE IF NOT EXISTS booking_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    date DATE NOT NULL COMMENT '预约日期',
    time_slot VARCHAR(50) NOT NULL COMMENT '时间段 HH:mm-HH:mm',
    cabin_name VARCHAR(50) NOT NULL COMMENT '舱室名称 如：1号舱',
    seat_name VARCHAR(50) NOT NULL COMMENT '座位名称 如：A座',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending待核销, completed已完成',
    payment_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态: unpaid未支付, paid已支付',
    payment_method VARCHAR(50) COMMENT '支付方式',
    payment_time DATETIME COMMENT '支付时间',
    consume_time DATETIME COMMENT '消费时间',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约订单表';

-- 每日访问记录表
CREATE TABLE IF NOT EXISTS daily_visit_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    visit_date DATE NOT NULL COMMENT '访问日期',
    visit_count INT DEFAULT 0 COMMENT '访问次数',
    last_visit_time DATETIME COMMENT '最后访问时间',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uk_user_date (user_id, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日访问记录表';

-- 创建索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_booking_orders_user_id ON booking_orders(user_id);
CREATE INDEX idx_booking_orders_date ON booking_orders(date);
CREATE INDEX idx_booking_orders_order_no ON booking_orders(order_no);
CREATE INDEX idx_member_packages_is_active ON member_packages(is_active);
CREATE INDEX idx_daily_visit_records_user_id ON daily_visit_records(user_id);
CREATE INDEX idx_daily_visit_records_visit_date ON daily_visit_records(visit_date);

-- 插入初始会员套餐数据示例
INSERT INTO member_packages (name, description, price, original_price, validity_days, visit_count, category, sort_order, is_active, features) VALUES
('体验卡', '初次体验氧舱服务', 99.00, 129.00, 7, 1, '个人畅享', 1, TRUE, '免费WiFi,专业指导'),
('周卡', '一周无限次体验', 199.00, 259.00, 7, -1, '个人畅享', 2, TRUE, '免费WiFi,专业指导,饮品'),
('月卡', '一个月无限次体验', 499.00, 699.00, 30, -1, '个人畅享', 3, TRUE, '免费WiFi,专业指导,饮品,按摩椅');