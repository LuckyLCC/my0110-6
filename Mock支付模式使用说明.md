# Mock支付模式使用说明

## 功能说明

Mock支付模式允许你在没有真实微信支付商户号的情况下，完整测试支付流程。订单数据会正常保存到数据库，但不会调用真实的微信支付接口。

## 配置方法

### 1. 启用Mock模式

在 `application.yml` 中设置：

```yaml
wechat:
  pay:
    mock: true  # 设置为 true 启用Mock模式
```

### 2. 配置说明

**Mock模式（`mock: true`）：**
- ✅ 订单会正常创建并保存到数据库
- ✅ 返回模拟的支付参数
- ✅ 前端可以测试支付流程
- ⚠️ 实际调用 `uni.requestPayment` 会失败（因为没有真实商户号）
- ✅ 支付失败后会提示"模拟支付成功"选项
- ✅ 点击"模拟成功"会更新订单状态为已支付

**真实模式（`mock: false`）：**
- ✅ 需要配置真实的商户号和API密钥
- ✅ 会调用真实的微信支付接口
- ✅ 可以完成真实的支付流程

## 使用流程

### 1. 创建订单

用户点击"立即支付"后：
1. 前端调用 `/api/payment/create-package-order` 创建订单
2. 订单数据保存到数据库（`payment_orders` 表）
3. 返回订单ID

### 2. 获取支付参数

1. 前端调用 `/api/payment/wechat-pay/{orderId}` 获取支付参数
2. Mock模式下，后端返回模拟的支付参数：
   ```json
   {
     "timeStamp": "1609459200",
     "nonceStr": "随机字符串",
     "package": "prepay_id=MOCK_PREPAY_ID_xxx",
     "signType": "RSA",
     "paySign": "MOCK_SIGN_xxx"
   }
   ```

### 3. 调起支付

1. 前端调用 `uni.requestPayment` 调起微信支付
2. 由于是Mock数据，支付会失败
3. 前端检测到Mock模式（通过 `package` 中包含 `MOCK_PREPAY_ID`）
4. 显示弹窗："当前为Mock模式，真实支付会失败。是否模拟支付成功？"

### 4. 模拟支付成功

1. 用户点击"模拟成功"
2. 前端调用 `/api/payment/mock-success/{orderId}` 接口
3. 后端更新订单状态为 `paid`
4. 前端显示"支付成功"并跳转到"我的"页面

## 数据库状态

### 订单创建后

```sql
SELECT * FROM payment_orders WHERE id = {orderId};
```

订单状态：`unpaid`

### Mock支付成功后

```sql
SELECT * FROM payment_orders WHERE id = {orderId};
```

订单状态：`paid`
支付时间：已设置

## 代码位置

### 后端

1. **配置类**：`WxPayConfig.java`
   - 添加了 `mock` 属性

2. **工具类**：`WxPayUtil.java`
   - `init()` 方法：检查Mock模式，跳过真实配置初始化
   - `generatePayParams()` 方法：Mock模式下返回模拟参数
   - `generateMockPayParams()` 方法：生成Mock支付参数

3. **控制器**：`PaymentController.java`
   - 添加了 `/api/payment/mock-success/{orderId}` 接口

4. **服务类**：`PaymentServiceImpl.java`
   - 订单创建和状态更新逻辑保持不变

### 前端

1. **支付页面**：`pages/payment/payment.vue`
   - `handlePay()` 方法：保存订单ID
   - `handleMockPaymentSuccess()` 方法：处理Mock支付成功
   - 支付失败时检测Mock模式并显示弹窗

2. **API封装**：`api/request.js`
   - 添加了 `api.payment.mockPaymentSuccess()` 方法

## 注意事项

### 1. 生产环境

⚠️ **重要**：生产环境必须设置 `mock: false` 并使用真实的商户号！

### 2. 订单数据

- Mock模式下，订单数据会正常保存到数据库
- 可以通过数据库查看订单状态
- Mock支付成功后，订单状态会更新为 `paid`

### 3. 支付流程

- Mock模式下，`uni.requestPayment` 会失败（这是正常的）
- 需要通过"模拟支付成功"选项来更新订单状态
- 真实模式下，支付成功会自动更新订单状态

### 4. 日志

Mock模式下，后端日志会显示：
```
⚠️  微信支付已启用 MOCK 模式，将使用模拟数据，不会调用真实微信支付接口
⚠️  此模式仅用于开发测试，生产环境请设置为 false
```

## 测试步骤

1. **配置Mock模式**
   ```yaml
   wechat:
     pay:
       mock: true
   ```

2. **启动后端服务**
   - 查看日志确认Mock模式已启用

3. **测试支付流程**
   - 在小程序中点击"立即支付"
   - 创建订单成功
   - 获取支付参数成功
   - 调起支付失败（正常）
   - 点击"模拟成功"
   - 订单状态更新为已支付
   - 跳转到"我的"页面

4. **验证数据库**
   ```sql
   SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 1;
   ```
   - 检查订单状态是否为 `paid`
   - 检查支付时间是否已设置

## 切换到真实支付

当你有真实的商户号后：

1. **更新配置**
   ```yaml
   wechat:
     pay:
       mock: false  # 关闭Mock模式
       mchid: 1234567890  # 你的真实商户号
       apiKey: your-real-api-key  # 你的真实API密钥
   ```

2. **重启服务**
   - 后端会初始化真实的微信支付配置

3. **测试真实支付**
   - 支付流程会调用真实的微信支付接口
   - 支付成功后会通过回调更新订单状态

## 常见问题

### Q: Mock模式下支付失败是正常的吗？

A: 是的，这是正常的。因为Mock模式下使用的是模拟的支付参数，微信支付接口会拒绝。需要通过"模拟支付成功"选项来更新订单状态。

### Q: 订单数据会保存吗？

A: 会的。Mock模式下，订单创建和状态更新都会正常保存到数据库。

### Q: 如何验证订单已创建？

A: 可以通过数据库查询：
```sql
SELECT * FROM payment_orders WHERE user_id = {userId} ORDER BY created_at DESC;
```

### Q: Mock支付成功后，订单状态会更新吗？

A: 会的。调用 `/api/payment/mock-success/{orderId}` 接口后，订单状态会更新为 `paid`。

## 总结

Mock支付模式让你可以在没有真实商户号的情况下：
- ✅ 完整测试支付流程
- ✅ 验证订单创建和保存
- ✅ 测试前端支付逻辑
- ✅ 验证订单状态更新

当你有真实商户号后，只需将 `mock: false` 即可切换到真实支付。

