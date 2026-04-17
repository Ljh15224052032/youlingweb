# 游领资本 (GHOST) — Web3 社群平台

一个面向 Web3 社群的活动汇总与用户管理平台，提供空投活动发布、新手教育、合约教学、积分兑换等功能。

## 在线预览

部署在 Cloudflare Pages，访问即可预览。

## 技术栈

| 技术 | 用途 |
|---|---|
| React 19 (CRA) | 前端框架 |
| React Router DOM v7 | 客户端路由 |
| Zustand + persist | 状态管理 + 本地持久化 |
| Supabase | 数据库 + 存储 + 认证（BaaS） |
| SweetAlert2 | 弹窗交互 |
| SimpleBar | 自定义滚动条 |
| bcryptjs | 密码哈希 |
| marked / react-markdown | Markdown 渲染 |

## 快速启动

```bash
npm install
npm start
```

## 构建

```bash
npm run build
```

## 环境变量

在根目录创建 `.env.local`：

```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- `REACT_APP_SUPABASE_URL`：Supabase 项目 URL
- `REACT_APP_SUPABASE_ANON_KEY`：Supabase Anon Key
- 修改 `.env.local` 后需重启开发服务器

## 路由结构

| URL | 页面 | 说明 |
|---|---|---|
| `/` | 落地页 | 官网首页，无需登录 |
| `/login` | 登录页 | 邮箱密码登录 |
| `/register` | 注册页 | 邮箱注册 + 邀请码 |
| `/forgot` | 找回密码 | 邮箱确认后重置密码 |
| `/dashboard` | 自动跳转 | → `/dashboard/airdrop` |
| `/dashboard/airdrop` | 空投活动 | 需要账号验证 |
| `/dashboard/newbie` | 新手知识 | 需要账号验证 |
| `/dashboard/contract` | 合约教学 | 需要高级用户权限 |
| `/dashboard/points` | 积分兑换 | 需要账号验证 |
| `/dashboard/profile` | 个人中心 | 登录即可访问 |

## 功能模块

### 空投活动
- 卡片网格布局，按状态分类筛选（全部/进行中/即将开始/已结束）
- 搜索框实时过滤
- 根据时间自动判断活动状态
- 参与提交：文字描述 + 图片上传

### 新手知识
- 卡片网格 + 分类 Tab 筛选
- 点击弹窗展示 Markdown 内容
- 封面图展示

### 合约教学
- 双重权限控制（验证 + 高级用户类型）
- 难度等级标签
- Markdown 内容渲染

### 积分兑换
- 商品卡片展示（积分、库存、状态）
- 兑换申请 + 审核流程
- 赚取积分途径说明

### 个人中心
- 单页布局：信息卡片 + Tab 切换
- 编辑昵称、绑定交易所 UID（币安/Bitget/OKX）
- 邀请码复制
- 完善指引（交易所注册链接）

### 落地页
- Hero 区域 + 粒子动画
- 功能亮点卡片
- 新手教学链接
- 响应式设计（桌面 + 移动端抽屉导航）

## 目录结构

```
src/
├── pages/
│   ├── HomePage.js          # 落地页
│   └── HomePage.css
├── components/
│   ├── Airdrop.js            # 空投活动
│   ├── NewbieGuide.js        # 新手知识
│   ├── ContractTutorial.js   # 合约教学
│   ├── PointsExchange.js     # 积分兑换
│   ├── UserProfile.js        # 个人中心
│   └── Components.css        # 组件公共样式
├── services/
│   └── supabaseClient.js     # Supabase 客户端
├── store/
│   └── userStore.js          # Zustand 状态管理
├── App.js                    # 路由 + Dashboard 布局
├── App.css                   # Dashboard 样式
├── AuthContainer.js          # 认证页容器（粒子动画）
├── Login.js / Register.js    # 登录/注册
├── ForgotPassword.js         # 找回密码
└── index.js                  # 入口
```

## 数据库（Supabase）

| 表名 | 说明 |
|---|---|
| `users` | 用户信息（邮箱、密码哈希、积分、邀请码、UID 绑定等） |
| `airdrops` | 空投活动 |
| `activity_submissions` | 活动参与提交 |
| `newbie_guides` | 新手指南 |
| `contract_tutorials` | 合约教学 |
| `points_exchange_items` | 积分商品 |
| `points_exchange_applications` | 兑换申请 |

Storage Bucket: `activity_images`
RPC: `increment_participants`

## 部署

### Cloudflare Pages
1. 连接 GitHub 仓库
2. 构建命令：`CI=false npm run build`
3. 输出目录：`build`
4. 环境变量配置 `REACT_APP_SUPABASE_URL` 和 `REACT_APP_SUPABASE_ANON_KEY`

## 安全提示

- 不要在仓库中提交真实密钥或私密配置
- 敏感配置放在 `.env.local`，已被 `.gitignore` 排除
- 项目尚未配置 Supabase RLS，上线前必须配置
