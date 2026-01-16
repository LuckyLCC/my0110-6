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
    role VARCHAR(20) DEFAULT 'user' COMMENT '用户角色: user-普通用户, staff-商家',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    last_login_time DATETIME COMMENT '最后登录时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 会员套餐表
CREATE TABLE IF NOT EXISTS member_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '套餐代码',
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    description TEXT COMMENT '套餐描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    validity_days INT NOT NULL COMMENT '有效期天数',
    people INT NOT NULL COMMENT '适用人数',
    avg_price_per_time DECIMAL(10,2) COMMENT '单次平均价格',
    times_per_person INT COMMENT '每人可使用次数',
    badge VARCHAR(50) COMMENT '徽章/标签',
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
    payment_order_id BIGINT COMMENT '关联的购卡记录ID（如果是使用会员卡预约）',
    date DATE NOT NULL COMMENT '预约日期',
    time_slot VARCHAR(50) NOT NULL COMMENT '时间段 HH:mm-HH:mm',
    cabin_name VARCHAR(50) NOT NULL COMMENT '舱室名称 如：1号舱',
    seat_name VARCHAR(50) NOT NULL COMMENT '座位名称 如：A座',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending待核销, completed已完成, cancelled已取消',
    payment_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态: unpaid未支付, paid已支付',
    payment_method VARCHAR(50) COMMENT '支付方式',
    payment_time DATETIME COMMENT '支付时间',
    consume_time DATETIME COMMENT '消费时间',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_payment_order_id (payment_order_id)
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

-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    package_id BIGINT NOT NULL COMMENT '套餐ID',
    package_name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    status VARCHAR(20) DEFAULT 'unpaid' COMMENT '状态: unpaid未支付, paid已支付, cancelled已取消',
    payment_method VARCHAR(50) COMMENT '支付方式',
    payment_time DATETIME COMMENT '支付时间',
    card_start_date DATETIME COMMENT '卡开始日期',
    card_end_date DATETIME COMMENT '卡到期日期',
    transaction_type VARCHAR(10) DEFAULT 'NEW' COMMENT '交易类型: NEW-新开卡, RENEW-续费',
    card_status VARCHAR(20) DEFAULT '未生效' COMMENT '卡状态: 未生效, 生效中, 已完成',
    remaining_times INT COMMENT '剩余次数（仅次卡有效，其他卡种为NULL）',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付订单表';

-- 创建索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_booking_orders_user_id ON booking_orders(user_id);
CREATE INDEX idx_booking_orders_date ON booking_orders(date);
CREATE INDEX idx_booking_orders_order_no ON booking_orders(order_no);
CREATE INDEX idx_member_packages_is_active ON member_packages(is_active);
CREATE INDEX idx_daily_visit_records_user_id ON daily_visit_records(user_id);
CREATE INDEX idx_daily_visit_records_visit_date ON daily_visit_records(visit_date);

-- 创建支付订单表索引
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);

-- 商家表
CREATE TABLE IF NOT EXISTS staffs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '商家用户名',
    password VARCHAR(255) NOT NULL COMMENT '商家密码（加密后的密码）',
    name VARCHAR(100) COMMENT '商家名称/姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active-激活, inactive-停用',
    last_login_time DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家表';

-- 创建商家表索引
CREATE INDEX idx_staffs_username ON staffs(username);
CREATE INDEX idx_staffs_status ON staffs(status);

-- 邀请关系表
CREATE TABLE IF NOT EXISTS invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inviter_id BIGINT NOT NULL COMMENT '邀请人ID',
    invitee_id BIGINT COMMENT '被邀请人ID（接受邀请后填充）',
    payment_order_id BIGINT NOT NULL COMMENT '关联的支付订单ID',
    invite_code VARCHAR(50) UNIQUE NOT NULL COMMENT '邀请码',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending-待接受, accepted-已接受, expired-已过期',
    created_at DATETIME NOT NULL,
    accepted_at DATETIME COMMENT '接受邀请时间',
    expired_at DATETIME COMMENT '过期时间（可选，默认30天）',
    INDEX idx_inviter_id (inviter_id),
    INDEX idx_invitee_id (invitee_id),
    INDEX idx_invite_code (invite_code),
    INDEX idx_payment_order_id (payment_order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请关系表';