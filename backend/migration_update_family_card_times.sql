-- 迁移脚本：为家庭次卡设置 times_per_person
-- 对于家庭次卡，times_per_person 就是总次数（不是每人次数）

-- 更新家庭100次卡
UPDATE member_packages 
SET times_per_person = 100 
WHERE code = 'FAMILY_100' AND (times_per_person IS NULL OR times_per_person = 0);

-- 更新家庭200次卡（如果存在）
UPDATE member_packages 
SET times_per_person = 200 
WHERE code = 'FAMILY_200' AND (times_per_person IS NULL OR times_per_person = 0);

-- 更新其他家庭次卡（根据名称匹配）
UPDATE member_packages 
SET times_per_person = 100 
WHERE category = '家庭/次卡' 
  AND name LIKE '%100次%' 
  AND (times_per_person IS NULL OR times_per_person = 0);

UPDATE member_packages 
SET times_per_person = 200 
WHERE category = '家庭/次卡' 
  AND name LIKE '%200次%' 
  AND (times_per_person IS NULL OR times_per_person = 0);

