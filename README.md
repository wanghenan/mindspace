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
