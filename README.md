# Youling React — Web3 社群活动汇总与用户管理平台

一个面向国内 Web3 社群的活动汇总与用户管理前端应用，帮助运营方统一发布活动/空投信息、引导新手学习、管理用户资料与积分，并为社群成员提供清晰的参与路径。

## 技术栈
- React（CRA）
- Zustand（状态管理）
- Supabase（数据与存储）
- SweetAlert2（弹窗交互）
- Simplebar（滚动容器）
- bcryptjs（密码校验）
- marked / React Markdown（Markdown 渲染）

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
在根目录创建 `.env.local`，示例：

```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

说明：
- `REACT_APP_SUPABASE_URL`：Supabase 项目 URL。
- `REACT_APP_SUPABASE_ANON_KEY`：Supabase 匿名访问 Key。
- 若使用本地脚本或直连数据库，可能会有单独的 `.env.supabase` 文件；该文件仅供本地使用，不应提交到仓库。

## 功能模块概览
- 登录/注册/找回密码
- 活动/空投列表与参与提交（支持文本 + 图片提交）
- 新手指南、合约教程、交易工具
- 用户资料与积分管理（等级、认证状态、邀请码等）
- 积分兑换
- 内容管理（用于运营配置与发布）

## 数据与服务依赖
基于 Supabase：
- 数据表（示例）：`users`、`airdrops`、`activity_submissions`
- Storage Bucket：`activity_images`
- RPC：`increment_participants`

## 目录结构（关键部分）
```
src/
  components/
    Airdrop.js
    NewbieGuide.js
    ContractTutorial.js
    TradingTools.js
    UserProfile.js
    PointsExchange.js
    ContentManagement.js
  services/
    supabaseClient.js
  store/
    userStore.js
  App.js
  App.css
  AuthContainer.js
  Login.js
  Register.js
```

## 截图
- 登录页
  ![登录页](jietu-picture/image.png)
- 个人中心
  ![个人中心](jietu-picture/26-033.png)
- 新手知识
  ![新手知识](jietu-picture/26-032.png)
- 空投活动
  ![空投活动](jietu-picture/26-03.png)

## 常见问题
- 启动报错或数据为空：请确认已正确配置 Supabase 环境变量。
- 认证/积分等信息不更新：检查 Supabase 表结构与 RPC 是否正确配置。

## 安全提示
- 不要在仓库中提交任何真实密钥、数据库密码或私密配置。
- 建议将敏感配置放在 `.env.local` 并加入 `.gitignore`。
