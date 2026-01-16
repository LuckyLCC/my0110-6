-- 迁移脚本：为 payment_orders 表添加 card_status 和 remaining_times 字段
-- card_status: 用于存储卡的状态（未生效、生效中、已完成）
-- remaining_times: 用于存储次卡的剩余次数（仅次卡有效，其他卡种为NULL）

ALTER TABLE payment_orders 
ADD COLUMN card_status VARCHAR(20) DEFAULT '未生效' COMMENT '卡状态: 未生效, 生效中, 已完成';

ALTER TABLE payment_orders 
ADD COLUMN remaining_times INT COMMENT '剩余次数（仅次卡有效，其他卡种为NULL）';

-- 更新现有已支付订单的状态和剩余次数
-- 注意：这里需要根据实际的套餐分类来判断是否是次卡
-- 如果无法判断，remaining_times 保持为 NULL
UPDATE payment_orders 
SET card_status = CASE
    WHEN status = 'paid' THEN
        CASE
            -- 如果当前时间 < 卡开始日期，则为未生效
            WHEN card_start_date IS NOT NULL AND NOW() < card_start_date THEN '未生效'
            -- 如果当前时间 > 卡到期日期，则为已完成
            WHEN card_end_date IS NOT NULL AND NOW() > card_end_date THEN '已完成'
            -- 如果当前时间在有效期内，则为生效中
            WHEN (card_start_date IS NULL OR NOW() >= card_start_date) 
                 AND (card_end_date IS NULL OR NOW() <= card_end_date) THEN '生效中'
            ELSE '已完成'
        END
    ELSE '未生效'
END
WHERE status = 'paid';

-- 注意：remaining_times 的初始化需要在应用层根据套餐类型和已核销订单数来计算
-- 这里不进行初始化，由应用层在支付成功或定时任务中更新

