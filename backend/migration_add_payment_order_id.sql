-- 迁移脚本：为 booking_orders 表添加 payment_order_id 字段
-- 用于关联购卡记录，以便追踪家庭次卡的使用情况

ALTER TABLE booking_orders 
ADD COLUMN payment_order_id BIGINT COMMENT '关联的购卡记录ID（如果是使用会员卡预约）';

-- 添加索引以提高查询性能
CREATE INDEX idx_payment_order_id ON booking_orders(payment_order_id);

