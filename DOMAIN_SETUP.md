# 阿里云域名 + Vercel 部署配置指南

## 🌐 域名映射配置步骤

### 1. Vercel项目部署
确保项目已成功部署到Vercel，获得默认URL（如：mindspace-v1-1.vercel.app）

### 2. 在Vercel添加自定义域名
1. 进入Vercel项目 → Settings → Domains
2. 点击"Add"按钮，输入域名
3. 记录Vercel提供的DNS配置信息

### 3. 阿里云DNS配置

#### 方法一：CNAME记录配置（推荐）
适用于子域名（如：app.yourdomain.com）

**在阿里云域名控制台：**
1. 登录阿里云控制台
2. 进入域名管理 → 域名列表
3. 点击目标域名的"解析"
4. 添加解析记录：
   - 记录类型：`CNAME`
   - 主机记录：`app`（或其他子域名前缀）
   - 解析线路：`默认`
   - 记录值：`cname.vercel-dns.com`
   - TTL：`600`（10分钟）

#### 方法二：A记录配置
适用于根域名（如：yourdomain.com）

**在阿里云域名控制台：**
1. 添加解析记录：
   - 记录类型：`A`
   - 主机记录：`@`（根域名）或`www`
   - 解析线路：`默认`
   - 记录值：`76.76.21.21`（Vercel的IP地址）
   - TTL：`600`

### 4. 常用DNS记录配置示例

```
# 子域名配置（推荐）
记录类型: CNAME
主机记录: app
记录值: cname.vercel-dns.com

# 根域名配置
记录类型: A
主机记录: @
记录值: 76.76.21.21

# www子域名配置
记录类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
```

### 5. 验证配置

#### 检查DNS传播
```bash
# 检查CNAME记录
nslookup app.yourdomain.com

# 检查A记录
nslookup yourdomain.com
```

#### 在线工具验证
- DNS Checker: https://dnschecker.org/
- What's My DNS: https://www.whatsmydns.net/

### 6. 常见问题解决

#### 问题1：Invalid Configuration
**原因**：DNS记录配置错误或传播未完成
**解决**：
- 检查DNS记录是否正确
- 等待DNS传播（通常5-30分钟）
- 使用在线工具检查DNS状态

#### 问题2：SSL证书问题
**原因**：域名验证失败
**解决**：
- 确保DNS记录正确指向Vercel
- 等待SSL证书自动颁发（通常几分钟）
- 在Vercel控制台检查SSL状态

#### 问题3：域名无法访问
**原因**：DNS传播延迟或配置错误
**解决**：
- 清除本地DNS缓存
- 使用不同网络测试
- 检查防火墙设置

### 7. 最佳实践

1. **使用子域名**：推荐使用子域名（如app.yourdomain.com）而非根域名
2. **TTL设置**：初始配置时使用较短TTL（600秒），稳定后可增加
3. **备份配置**：记录所有DNS配置，便于后续维护
4. **监控状态**：定期检查域名和SSL证书状态

### 8. 配置时间线

- DNS记录添加：立即
- DNS传播：5-30分钟
- SSL证书颁发：5-10分钟
- 完全生效：通常30分钟内

## 🚀 MindSpace项目特定配置

假设你的域名是 `example.com`，推荐配置：

```
主域名: mindspace.example.com
配置类型: CNAME
记录值: cname.vercel-dns.com
```

这样用户可以通过 `https://mindspace.example.com` 访问你的MindSpace应用。