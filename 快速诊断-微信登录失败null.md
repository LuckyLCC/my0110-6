# 快速诊断：微信登录失败: null

## ⚠️ 重要：必须先重启后端服务

修改代码后，**必须重启后端服务**才能生效！

```bash
# 停止当前运行的后端服务（Ctrl+C）
# 然后重新启动
cd backend
# 使用你的启动命令，例如：
mvn spring-boot:run
# 或
java -jar target/xxx.jar
```

## 🔍 诊断步骤

### 步骤 1：检查后端日志

查看最新的错误日志：

```bash
cd backend
tail -50 logs/application.log | grep -A 10 "微信登录"
```

**应该能看到：**
- 详细的错误信息（不再是 null）
- 微信 API 的响应内容
- 配置检查结果

### 步骤 2：检查配置

打开 `backend/src/main/resources/application.yml`，确认：

```yaml
wechat:
  miniapp:
    appid: wx1a44cbe925471245  # 你的 AppID
    secret: 019d069035074ed1c45d1c35d69ed8c2  # 你的 AppSecret
```

**检查点：**
- ✅ AppID 和 Secret 都有值
- ✅ 没有多余的空格
- ✅ 值与微信公众平台一致

### 步骤 3：验证配置是否正确加载

重启后端后，查看启动日志，应该能看到配置加载信息。

如果看到类似错误：
```
微信AppID未配置
微信AppSecret未配置
```

说明配置没有正确加载，检查：
1. `application.yml` 文件格式是否正确
2. 缩进是否正确（YAML 对缩进敏感）
3. 是否在正确的配置文件中

### 步骤 4：测试微信 API 连接

在服务器上测试能否访问微信 API：

```bash
# 测试网络连接
curl -I https://api.weixin.qq.com

# 应该返回 HTTP 200
```

### 步骤 5：查看详细错误信息

修复后的代码会显示详细的错误信息，例如：

**之前：**
```
微信登录失败: null
```

**现在应该显示：**
```
微信登录失败: 微信登录API错误: invalid code (errcode: 40029) - code无效或已过期
```

或

```
微信登录失败: 微信AppID未配置
```

## 🛠️ 常见问题及解决方案

### 问题 1：仍然显示 "null"

**原因：** 后端服务没有重启

**解决：**
1. 停止后端服务
2. 重新编译（如果需要）
3. 重新启动服务
4. 再次测试登录

### 问题 2：显示 "微信AppID未配置"

**原因：** 配置没有正确加载

**解决：**
1. 检查 `application.yml` 文件格式
2. 确认缩进使用空格（不是 Tab）
3. 重启服务

### 问题 3：显示 "微信登录API错误: invalid code"

**原因：** Code 无效或已过期

**解决：**
1. Code 只能使用一次
2. Code 有效期 5 分钟
3. 每次登录都需要重新获取 code
4. 确保前端每次调用 `uni.login` 获取新的 code

### 问题 4：显示 "微信登录API错误: invalid appid"

**原因：** AppID 配置错误

**解决：**
1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 复制正确的 AppID
4. 更新 `application.yml`
5. 重启服务

### 问题 5：显示 "微信登录API错误: invalid secret"

**原因：** AppSecret 配置错误

**解决：**
1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置
3. 如果忘记 Secret，点击"重置"
4. 用管理员微信扫码确认
5. 复制新的 AppSecret
6. 更新 `application.yml`
7. 重启服务

## 📋 检查清单

在报告问题前，请确认：

- [ ] 后端服务已重启
- [ ] 查看了最新的后端日志
- [ ] 确认 AppID 和 AppSecret 配置正确
- [ ] 确认值与微信公众平台一致
- [ ] 测试了网络连接
- [ ] 前端每次登录都获取新的 code

## 📝 日志示例

修复后，日志应该类似这样：

```
DEBUG WechatUtil - 开始调用微信登录API，code长度: 32
DEBUG WechatUtil - AppID: wx1a44cbe925471245, Secret长度: 32
DEBUG WechatUtil - 请求微信API: https://api.weixin.qq.com/sns/jscode2session?appid=wx1a44cbe925471245&secret=***&js_code=xxx&grant_type=authorization_code
DEBUG WechatUtil - 微信API响应状态: 200 OK, 响应体: {"openid":"xxx","session_key":"xxx"}
```

或错误情况：

```
ERROR WechatUtil - 微信API返回错误: errcode=40029, errmsg=invalid code
ERROR UserController - 微信登录失败: 微信登录API错误: invalid code (errcode: 40029) - code无效或已过期（code只能使用一次，有效期5分钟）
```

## 🚀 下一步

1. **重启后端服务**
2. **查看日志**，确认错误信息不再是 null
3. **根据具体错误信息**，参考上面的解决方案
4. **如果仍有问题**，提供完整的日志信息

