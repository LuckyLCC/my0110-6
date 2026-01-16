-- 更新 booking_orders 表的 status 字段注释，添加 cancelled 状态
-- 执行时间：2026-01-15

-- 更新字段注释（MySQL 5.7+）
ALTER TABLE booking_orders 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'pending' 
COMMENT '状态: pending待核销, completed已完成, cancelled已取消';

-- 注意：
-- 1. 字段类型 VARCHAR(20) 已经足够存储 'cancelled'，无需修改字段类型
-- 2. 如果数据库已经存在数据，现有数据不受影响
-- 3. 新创建的订单可以设置为 'cancelled' 状态

