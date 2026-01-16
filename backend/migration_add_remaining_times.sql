-- 迁移脚本：为 payment_orders 表添加 remaining_times 字段
-- remaining_times: 用于存储次卡的剩余次数（仅次卡有效，其他卡种为NULL）

ALTER TABLE payment_orders 
ADD COLUMN remaining_times INT COMMENT '剩余次数（仅次卡有效，其他卡种为NULL）';

-- 为现有的次卡订单初始化剩余次数
-- 注意：这里需要根据实际的套餐分类来判断是否是次卡
-- 如果无法通过SQL判断，remaining_times 保持为 NULL，由应用层在支付成功或定时任务中更新

-- 对于家庭次卡，需要根据已核销的订单数来计算剩余次数
-- 这个计算比较复杂，建议在应用层处理，这里只添加字段

-- 可选：如果已知某些订单是次卡，可以手动初始化
-- UPDATE payment_orders 
-- SET remaining_times = (SELECT times_per_person FROM member_packages WHERE id = payment_orders.package_id)
-- WHERE package_id IN (SELECT id FROM member_packages WHERE category = '家庭/次卡')
--   AND status = 'paid'
--   AND remaining_times IS NULL;

