# MindSpace v1.0

专为高敏感人群（HSP）及高压都市女性打造的 **AI 情绪急救与陪伴助手**。

## 项目概述

MindSpace v1.0 在 MVP 基础上扩展了三大核心功能：
- **60s 情绪急救（SOS）**：针对急性压力反应的即时物理干预
- **AI 深度共情对话**：提供 CBT 视角的认知重塑和情绪疏导
- **智能情绪分析与周报**：帮助用户从长期视角理解自己的情绪模式

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **样式方案**: Tailwind CSS
- **路由管理**: React Router v6
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **AI服务**: 阿里云DashScope / OpenAI API

## 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env`，并填入你的 API Key：
```bash
cp .env.example .env
```

### 启动开发服务器
```bash
npm run dev
```

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
├── components/          # 通用组件
│   └── Layout.tsx      # 页面布局（含底部导航）
├── pages/              # 页面组件
│   ├── HomePage.tsx           # 首页（SOS入口）
│   ├── ChatPage.tsx           # AI对话页
│   ├── InsightPage.tsx        # 情绪周报页
│   ├── SOSEmotionPage.tsx     # SOS情绪选择页
│   ├── SOSCardPage.tsx        # 60s急救卡片页
│   └── SOSFeedbackPage.tsx   # SOS反馈页
├── services/           # 服务层
│   ├── aiService.ts           # AI对话服务
│   └── firstAidService.ts     # 急救内容服务
├── store/              # 状态管理
│   └── useAppStore.ts         # 全局状态
├── data/               # 数据文件
│   └── firstAidContent.ts     # 急救内容库
├── types/              # 类型定义
│   └── index.ts
├── App.tsx             # 应用入口
├── main.tsx           # React入口
└── index.css          # 全局样式
```

## 开发进度

### ✅ 已完成
- [x] 项目初始化与依赖配置
- [x] 核心路由与布局架构
- [x] 首页与SOS入口

### 🚧 进行中
- [ ] SOS情绪输入页面
- [ ] 60s急救卡片系统
- [ ] 急救内容库模块

### 📋 待开发
- [ ] AI对话界面
- [ ] AI对话服务层
- [ ] 情绪周报功能

## 设计原则

### 极简交互
- 每页只有一个主要操作
- 点击即响应，无多余确认
- 误操作可轻松返回

### 移动优先
- 320px起始设计
- 触摸友好的按钮尺寸(最小44px)
- 流畅的动画和过渡效果

### 个性化体验
- 基于用户身份的差异化建议
- AI回复符合MindSpace风格（温暖、短句、共情）

## 用户流程

### Flow 1: 紧急时刻（SOS Path）
```
首页 → SOS按钮 → 情绪选择 → 60s急救卡片 → 反馈询问 → 结束/跳转对话
```

### Flow 2: 日常陪伴（Chat Path）
```
首页 → 对话Tab → AI对话界面 → 多轮对话 → 自动情绪标签生成
```

### Flow 3: 复盘洞察（Insight Path）
```
首页 → 洞察Tab → 情绪周报 → 情绪气象图/高频词云/压力源分析
```

## 部署

推荐使用 Vercel 进行部署：

```bash
# 构建
npm run build

# 部署到 Vercel
npx vercel --prod
```

## 许可证

本项目采用 MIT 许可证

---

*MindSpace - 让每一次情绪崩溃都能被温柔接住* ✨
