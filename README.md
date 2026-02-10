# MindSpace v1.0

专为高敏感人群（HSP）及高压都市女性打造的 **AI 情绪急救与陪伴助手**。

## 项目概述

MindSpace v1.0 是一款情绪健康管理应用，提供即时的情绪支持和长期的情绪洞察：

- **60s 情绪急救（SOS）**：针对急性压力反应的即时物理干预，包含呼吸练习、身体感知和认知重构
- **AI 深度共情对话**：提供温暖、理解的对话环境，帮助用户疏解情绪
- **情绪洞察**：记录和分析情绪模式，帮助用户从长期视角理解自己的情绪变化
- **主题系统**：支持浅色/深色模式，自动检测系统偏好并持久化保存

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **样式方案**: Tailwind CSS + CSS变量主题系统
- **路由管理**: React Router v6
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **AI服务**: 阿里云 DashScope / OpenAI API

## 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env`，并配置 API Key：
```bash
cp .env.example .env
```

**API Key 说明：**
- **内置 API Key（VITE_DASHSCOPE_API_KEY）**: 用于 SOS 情绪急救功能，由平台提供
- **用户配置 API Key**: 用户在「账户」页面自行配置，用于 AI 对话功能

这样的设计确保：
- SOS 急救功能开箱即用，无需用户配置
- AI 对话功能由用户使用自己的 API 配额
- 数据完全本地存储，保护用户隐私

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173

> **端口配置**: 默认使用 3000 端口。如端口被占用，启动会报错（已配置 `strictPort`）。

### 本地测试
- 默认访问地址: http://localhost:3000
- 配置页面路径: `/settings`

### 构建生产版本
```bash
npm run build
```

## 多模型 AI 服务配置

MindSpace 支持多家 AI 服务提供商，您可以根据需要选择不同的模型。

### 访问 AI 设置页面

- **页面路径**: `/settings`
- **导航方式**: 通过侧边栏菜单或主页导航进入设置页面

### 配置步骤

1. **打开设置页面**
   - 点击侧边栏的设置图标
   - 或直接访问 `/settings` 路径

2. **选择 AI 服务提供商**
   - 在设置页面选择您想使用的 AI 提供商
   - 支持的提供商见下方列表

3. **配置 API Key**
   - 获取对应提供商的 API Key（见下方链接）
   - 在设置页面输入您的 API Key
   - API Key 将安全保存在浏览器本地存储中

4. **选择模型**
   - 配置 API Key 后，可选择该提供商下的不同模型
   - 每个提供商提供多个模型选项，具有不同的性能特点

5. **保存配置**
   - 配置完成自动保存，即可开始使用 AI 对话功能

### 支持的 AI 提供商

MindSpace 当前支持 7 家主流 AI 服务提供商：

#### 1. OpenAI
- **官网**: https://platform.openai.com
- **支持模型**:
  - `gpt-4o` - GPT-4o（推荐，综合性能最佳）
  - `gpt-4o-mini` - GPT-4o Mini（轻量级，响应更快）
- **特点**: 上下文长度 128K，支持流式输出

#### 2. Zhipu AI（智谱AI）
- **官网**: https://open.bigmodel.cn
- **支持模型**:
  - `glm-4.7` - GLM-4.7（最新旗舰模型）
  - `glm-4.7-flash` - GLM-4.7 Flash（快速响应版本）
  - `glm-4.6` - GLM-4.6（稳定版本）
- **特点**: 上下文长度 200K，中文优化，支持流式输出

#### 3. Google Gemini
- **官网**: https://ai.google.dev
- **支持模型**:
  - `gemini-3-pro` - Gemini 3 Pro（深度推理）
  - `gemini-3-flash` - Gemini 3 Flash（高性能，上下文高达 1M）
- **特点**: 超长上下文支持，多模态能力强

#### 4. DeepSeek
- **官网**: https://platform.deepseek.com
- **支持模型**:
  - `deepseek-chat` - DeepSeek Chat（对话优化）
  - `deepseek-reasoner` - DeepSeek Reasoner（推理增强）
- **特点**: 上下文长度 128K，性价比高，支持流式输出

#### 5. Alibaba Cloud（阿里云）
- **官网**: https://dashscope.aliyun.com
- **支持模型**:
  - `qwen3-max` - Qwen3 Max（最强性能）
  - `qwen-plus` - Qwen Plus（均衡选择）
  - `qwen-flash` - Qwen Flash（极速响应）
- **特点**: 阿里云生态集成，中文理解优秀

#### 6. MiniMax
- **官网**: https://www.minimax.chat
- **支持模型**:
  - `MiniMax-M2.1` - MiniMax M2.1（标准版本）
  - `MiniMax-M2.1-lightning` - MiniMax M2.1 Lightning（极速版本）
- **特点**: 上下文长度 200K，对话自然流畅

#### 7. Grok（xAI）
- **官网**: https://x.ai
- **支持模型**:
  - `grok-4` - Grok-4（标准版本）
  - `grok-4-fast` - Grok-4 Fast（快速版本）
- **特点**: 上下文长度 128K，实时信息能力强

### 模型选择建议

- **追求最佳质量**: OpenAI GPT-4o、Zhipu GLM-4.7
- **追求性价比**: DeepSeek 系列、Alibaba Qwen 系列
- **追求速度**: 各家的 Flash/Mini/Lightning 版本
- **中文优化**: Zhipu GLM、Alibaba Qwen
- **超长上下文**: Gemini 3 Flash（支持 1M tokens）

### 常见问题

#### API Key 无效
- 检查 API Key 是否复制完整（注意前后空格）
- 确认 API Key 已在对应平台激活
- 验证 API Key 权限是否包含模型调用权限
- 更新 API Key 后请刷新页面

#### 模型调用失败
- 确认选择的模型名称与提供商当前支持的模型一致
- 部分模型可能需要单独开通权限
- 检查账户余额是否充足
- 查看浏览器控制台是否有详细错误信息

#### 网络连接问题
- 检查网络连接是否正常
- 部分提供商可能存在网络访问限制
- 开发环境下如遇到 CORS 问题，可能需要配置代理服务器

#### 无响应或响应慢
- 确认 API 账户余额充足
- 尝试切换到其他模型或提供商
- 检查请求格式是否正确
- 查看是否触达提供商的速率限制

> **注意**: 所有 API Key 仅存储在您的浏览器本地，不会上传到任何服务器。请妥善保管您的 API Key，不要在公共设备上保存。

## 项目结构

```
src/
├── components/               # 通用组件
│   ├── ChartHistory.tsx      # 对话历史侧边栏
│   ├── CelebrationAnimation.tsx # SOS庆祝动画
│   └── Layout.tsx           # 页面布局（含侧边栏导航）
├── pages/                   # 页面组件
│   ├── HomePage.tsx         # 首页（SOS入口）
│   ├── ChatPage.tsx         # AI对话页
│   ├── InsightPage.tsx      # 情绪洞察页
│   ├── SOSEmotionPage.tsx   # SOS情绪选择页
│   ├── SOSCardPage.tsx      # 60s急救卡片页
│   ├── SOSFeedbackPage.tsx  # SOS反馈页
│   ├── SOSAnalysisPage.tsx  # AI情绪分析页
│   └── SOSCelebrationPage.tsx # SOS完成庆祝页
├── services/                # 服务层
│   ├── aiService.ts         # AI对话服务
│   ├── enhancedChatService.ts # 增强对话服务
│   └── firstAidContent.ts  # 急救内容库
├── store/                   # 状态管理
│   ├── chatStore.ts        # 对话状态
│   └── themeStore.ts       # 主题状态
├── types/                   # 类型定义
│   └── index.ts
├── data/                    # 数据文件
│   └── firstAidContent.ts  # 急救内容数据
├── App.tsx                  # 应用入口
├── main.tsx                # React入口
└── index.css               # 全局样式（含主题变量）
```

## 核心功能

### 1. 主题系统
- ✅ 浅色/深色模式切换
- ✅ 系统主题自动检测
- ✅ LocalStorage持久化
- ✅ 平滑过渡动画（0.3s）
- ✅ CSS变量支持，易于定制

### 2. 首页
- ✅ 渐变Logo和标题
- ✅ 渐变文字文案（"我们懂你，陪伴你"）
- ✅ 天蓝色"开始急救"按钮（带脉冲动画）
- ✅ 三个功能图标（秒级响应、AI共情、私密空间）
- ✅ Notion风格设计

### 3. AI对话
- ✅ 左对齐消息布局
- ✅ 颜色区分（用户：黑色，AI：蓝色+竖线）
- ✅ 平滑滚动到最新消息
- ✅ "发送"按钮（Notion风格）
- ✅ "结束"按钮（新建对话）
- ✅ 对话历史管理

### 4. SOS急救流程
- ✅ 情绪选择（5种情绪类型）
- ✅ 强度等级（轻度、中度、重度、极重度）
- ✅ 60s急救卡片（呼吸、身体感知、认知重构）
- ✅ AI智能分析
- ✅ 用户反馈收集
- ✅ 完成庆祝动画
- ✅ 继续对话/回到首页选项

### 5. UI/UX设计
- ✅ Notion风格图标系统
- ✅ 统一的圆角和间距
- ✅ 平滑的动画和过渡
- ✅ 移动端优化
- ✅ 无障碍设计

## 开发进度

### ✅ 已完成
- [x] 项目初始化与依赖配置
- [x] 主题系统（浅色/深色）
- [x] 首页设计与动画
- [x] 侧边栏导航（Notion风格图标）
- [x] AI对话页面
- [x] 对话历史管理
- [x] SOS完整流程（5个页面）
- [x] AI情绪分析
- [x] 庆祝动画
- [x] 移动端适配

### 📋 待开发
- [ ] 情绪洞察页面（InsightPage）
- [ ] 情绪周报生成
- [ ] 情绪数据可视化
- [ ] 用户偏好设置
- [ ] 数据持久化（LocalStorage/IndexedDB）

## 设计原则

### 极简交互
- 每页只有一个主要操作
- 点击即响应，无多余确认
- 误操作可轻松返回
- Notion风格：简洁、清晰、高效

### 视觉设计
- 统一的Notion风格图标系统
- 柔和的渐变色（紫-粉配色）
- 平滑的过渡动画（0.3s ease）
- 充足的留白和呼吸感

### 情感化设计
- 温暖的文案和鼓励
- 庆祝用户的小成就
- AI回复风格：共情、简洁、支持性
- 微交互的愉悦感

### 移动优先
- 320px起始设计
- 触摸友好的按钮尺寸（最小44px）
- 流畅的动画和过渡效果
- 响应式布局

## 用户流程

### Flow 1: 紧急时刻（SOS Path）
```
首页 → 开始急救 → 情绪选择 → 强度选择 → 身体感受 → 
60s急救卡片 → AI分析 → 用户反馈 → 庆祝页面 → 继续对话/回到首页
```

### Flow 2: 日常陪伴（Chat Path）
```
首页 → 对话图标 → AI对话界面 → 多轮对话 → 
结束（新建对话）/ 继续对话
```

### Flow 3: 深度洞察（Insight Path - 待开发）
```
首页 → 洞察图标 → 情绪周报 → 情绪气象图/高频词云/压力源分析
```

## 主题定制

主题使用CSS变量定义，可在 `src/index.css` 中轻松定制：

### 浅色主题
```css
:root {
  --bg-primary: #FFFFFF;      /* 主背景 */
  --bg-secondary: #FAFAFA;    /* 次级背景 */
  --text-primary: #171717;    /* 主文字 */
  --accent: #6B73FF;          /* 主题色 */
}
```

### 深色主题
```css
[data-theme="dark"] {
  --bg-primary: #191919;
  --bg-secondary: #202020;
  --text-primary: #FAFAFA;
  --accent: #8186FF;
}
```

## 部署

推荐使用 Vercel 进行部署：

```bash
# 构建
npm run build

# 部署到 Vercel
npx vercel --prod
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

本项目采用 MIT 许可证

---

*MindSpace - 让每一次情绪崩溃都能被温柔接住* ✨
