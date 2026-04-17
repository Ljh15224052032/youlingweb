# 变更日志 (CHANGELOG)

> 记录每次开发改动，方便回看和追溯

---

## [2026-04-17] Step 1 — 环境变量隔离

**目标**：移除代码中硬编码的 Supabase 密钥，改为环境变量管理

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `.env.local` | 新建 | 存放 Supabase URL 和 Anon Key，已被 .gitignore 排除 |
| `src/services/supabaseClient.js` | 修改 | 移除硬编码的后备值，改为只从环境变量读取，缺失时报错 |

**关键改动**：
- `supabaseClient.js` 第 3-4 行：`|| 'https://...'` 和 `|| 'eyJ...'` 硬编码值已删除
- 环境变量改为从 `.env.local` 读取：`REACT_APP_SUPABASE_URL`、`REACT_APP_SUPABASE_ANON_KEY`
- 注意：修改 `.env.local` 后需重启开发服务器（`npm start`）才能生效

---

## [2026-04-17] Step 2 — 官网落地页 + 新手教学公开

**目标**：未登录用户打开网站即可看到官网首页和新手教学，点击登录/注册才进入认证页

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/pages/HomePage.js` | 新建 | 落地页组件：导航栏、Hero区、功能卡片、新手教学链接、CTA、Footer |
| `src/pages/HomePage.css` | 新建 | 落地页样式，保持黑金风格，响应式适配 |
| `src/App.js` | 修改 | 引入 HomePage，未登录显示落地页，点击按钮跳认证页 |
| `src/AuthContainer.js` | 修改 | 支持 initialPage/onBack 属性，新增「← 返回首页」按钮 |

**关键改动**：
- `App.js`：`!isLoggedIn` 分支从直接返回 `<AuthContainer />` 改为先显示 `<HomePage />`，登录/注册按钮触发认证页
- `AuthContainer.js`：新增 `initialPage` prop 控制默认显示登录/注册页，新增 `onBack` prop 显示返回首页按钮
- `HomePage.js`：新手教学区放入了 Google Docs 教程链接，后续可替换为 iframe 嵌入
- 落地页导航栏使用锚点跳转（首页/新手教学），固定在顶部，带毛玻璃效果

---

## [2026-04-17] Step 2.1 — 落地页细节优化

**目标**：修复滚动问题、添加粒子动画、优化移动端布局

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/index.css` | 修改 | 移除 `body { overflow: hidden }`，解决全局无法滚动的问题 |
| `src/pages/HomePage.js` | 修改 | 添加 particles.js 粒子动画到 Hero 区域；教学链接改为 Google Docs 实际链接 |
| `src/pages/HomePage.css` | 修改 | 粒子容器定位样式；移动端功能卡片改为图标+名称横排无背景；Hero min-height 调整为 60vh |

**关键改动**：
- `index.css`：移除 `overflow: hidden`，登录页 `.login-bg` 自身已有该属性，不受影响
- `HomePage.js`：粒子动画参数（50 粒子、金色、1.5 速度），与登录页风格一致但更柔和
- `HomePage.css`：768px 以下功能卡片去除背景/边框/描述，4 列横排；600px 以下不再覆盖为单列
- Hero 区域 `min-height` 从 `100vh` 改为 `60vh`，功能区更靠近首屏

---

## [2026-04-17] Step 3 — 新手教学公开访问（已完成）

**说明**：通过落地页 Google Docs 链接实现，无需修改 NewbieGuide.js 权限逻辑。未登录用户可直接在首页点击查看教程。

---

## [2026-04-17] Phase 2 Step 1 — 引入 react-router-dom 路由

**目标**：每个页面有独立 URL，刷新不丢失状态，支持浏览器前进/后退

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `package.json` | 新增依赖 | react-router-dom |
| `src/index.js` | 修改 | 用 BrowserRouter 包裹 App |
| `src/App.js` | 重写 | 用 Routes/Route 替代状态切换，新增 Dashboard 子组件 |
| `src/AuthContainer.js` | 修改 | 改为接收 page prop，内部用 navigate 跳转 |
| `src/Login.js` | 修改 | 用 useNavigate 替代 onLogin/onSwitch，登录后 navigate('/dashboard') |
| `src/Register.js` | 修改 | 用 useNavigate 替代 onBack，注册成功后 navigate('/login') |
| `src/ForgotPassword.js` | 修改 | 用 useNavigate 替代 onBack，重置后 navigate('/login') |
| `src/pages/HomePage.js` | 修改 | 用 useNavigate 替代 onLoginClick/onRegisterClick |

**路由结构**：

| URL | 页面 |
|---|---|
| `/` | 落地页首页 |
| `/login` | 登录页 |
| `/register` | 注册页 |
| `/forgot` | 找回密码 |
| `/dashboard` | 跳转到 /dashboard/airdrop |
| `/dashboard/:section` | 登录后各功能模块 |

**关键改动**：
- 未登录访问 `/dashboard/*` 自动跳转 `/login`
- 已登录访问 `/login` 自动跳转 `/dashboard`
- 侧边栏导航改为 `navigate()` 而非 `setCurrentSection`
- 移除了原来的 `showAuth`/`authPage`/`currentSection` 状态管理

---

## [2026-04-17] Phase 2 Step 2 — 删除看盘工具模块

**目标**：移除看盘工具（TradingTools/BinanceChart）全部相关代码

**删除文件**：

| 文件 | 说明 |
|---|---|
| `src/components/TradingTools.js` | 看盘工具主组件 |
| `src/components/BinanceChart.js` | 币安K线图表 |
| `src/components/BtcChart.js` | 备用图表（空壳） |
| `src/services/binanceApi.js` | 币安 API 封装 |

**修改文件**：

| 文件 | 改动 |
|---|---|
| `src/App.js` | 移除 TradingTools 导入、tools 图标、sections 条目 |
| `src/pages/HomePage.js` | 移除「实时看盘」功能卡片 |
| `src/pages/HomePage.css` | 功能卡片从 4 列改为 3 列 |

---

## [2026-04-17] Phase 2 Step 3 — 登录后界面重构

**目标**：将侧边栏布局改为顶部导航栏 + 移动端汉堡菜单抽屉

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/App.js` | 重写 Dashboard | 顶部导航栏（Logo + 菜单 + 用户/退出）、移动端抽屉、内容区 |
| `src/App.css` | 重写 | 全部 Dashboard 布局样式，移除旧侧边栏样式 |

**关键改动**：
- 顶部导航栏：居中显示各模块按钮，右侧显示用户名和退出
- 移动端（900px 以下）：隐藏顶部菜单，显示汉堡按钮，点击弹出左侧抽屉
- 抽屉带遮罩层，点击遮罩关闭
- 退出按钮直接调用 store.logout() + navigate('/')
- 内容区顶部显示当前模块图标+标题

---

## [2026-04-17] Phase 2 Step 4 — 个人中心重构 + 用户菜单

**目标**：退出按钮移入个人中心，顶部栏改为用户下拉菜单，个人中心布局重构为单页

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/App.js` | 修改 | 右上角改为用户名+下拉菜单（个人中心/退出登录），移动端抽屉增加个人中心按钮 |
| `src/App.css` | 修改 | 新增下拉菜单样式、抽屉底部按钮样式 |
| `src/components/UserProfile.js` | 重写 | 去掉左侧栏改为单页布局，信息卡片+表单+Tab切换，5个刷新合并为1个，退出在底部 |

**关键改动**：
- 顶部栏右上角：点击用户名展开下拉菜单，含「个人中心」和「退出登录」
- 个人中心：顶部信息卡片（头像+昵称+等级+积分+认证+邀请码），Tab 切换个人信息/完善指引
- 会员剩余天数仅高级用户可见
- 5 个独立刷新按钮合并为 1 个「刷新信息」
- 退出登录按钮移到个人信息表单底部
- 完善指引精简为 4 个板块

---

## [2026-04-17] Phase 2 Step 5 — 空投活动清理+优化

**目标**：清理未使用代码，增加状态筛选 Tab 和搜索框

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/components/Airdrop.js` | 重写 | 清理+筛选+搜索+卡片样式 |

**清理内容**：
- 移除未使用的导入：ReactMarkdown、rehypeRaw
- 移除未使用的变量：setCurrentSection、submissionLoading、userType、user、isLoggedIn、selectedAirdrop
- 移除约 10 处 console.log
- 移除 JS 注入 `<style>` 标签的弹窗样式
- 修复 `sanitize: false` 安全问题
- 移除硬编码的 description 字段，直接使用数据库字段

**新增功能**：
- 状态筛选 Tab：全部 / 进行中 / 即将开始 / 已结束
- 搜索框：按活动名称实时过滤
- 卡片样式重写为内联样式，统一黑金风格
- 空状态提示：「暂无活动」

---

## [2026-04-17] Phase 2 Step 6 — 网站图标 + 空投自动过期

**目标**：添加品牌 SVG 图标，空投活动根据时间自动判断状态

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `public/favicon.svg` | 新建 | 品牌图标（带黑底），用于浏览器标签页 |
| `public/index.html` | 修改 | favicon 改为 SVG 格式 |
| `src/App.js` | 修改 | LogoIcon 组件，Dashboard 顶部和抽屉加 logo；个人中心从导航栏移除，仅右上角入口 |
| `src/App.css` | 修改 | logo flex 对齐样式 |
| `src/pages/HomePage.js` | 修改 | LogoIcon 组件，导航栏和 Hero 区域加 logo |
| `src/pages/HomePage.css` | 修改 | 导航栏和 Hero logo 样式 |
| `src/components/Airdrop.js` | 修改 | 根据 start_time/end_time 自动判断活动状态 |
| `src/components/UserProfile.js` | 修复 | 输入框加 boxSizing: border-box 修复超出容器问题 |

**关键改动**：
- 浏览器标签页图标：带黑底的 SVG logo（清晰可见）
- 网站内 logo：透明底 SVG（Hero 区显示在 GHOST 文字右侧，导航栏在左侧）
- 空投自动过期：end_time 已过→已结束，start_time 未到→即将开始，否则→进行中
- 个人中心入口：顶部导航栏不再显示，仅通过右上角用户名下拉菜单进入
- 表单输入框修复 boxSizing 防止溢出

---

## [2026-04-17] Phase 2 Step 7 — 新手知识 + 积分兑换优化

**目标**：新手知识改为卡片网格布局，积分兑换统一黑金风格

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/components/NewbieGuide.js` | 重写 | 手风琴→卡片网格+分类Tab+弹窗详情 |
| `src/components/PointsExchange.js` | 重写 | 统一黑金卡片风格+完善赚取积分Tab+移除假数据 |
| `src/App.css` | 修改 | Dashboard 背景色改为 #181a20 |

**关键改动**：
- NewbieGuide：分类筛选 Tab（从数据库 category 动态读取）、卡片网格、点击弹窗展示 Markdown、去掉假数据兜底
- PointsExchange：商品卡片统一黑金风格（和空投活动一致）、赚取积分列出 5 种途径、兑换后自动刷新积分
- 两个组件均移除了 console.log 和假数据 fallback

---

## [2026-04-17] Phase 2 Step 8 — 找回密码修复 + 横向溢出修复

**目标**：找回密码功能可用化（方案 B），修复页面横向拖动问题

**改动文件**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/ForgotPassword.js` | 重写 | 去掉假验证码，改为输入邮箱确认后直接设置新密码并写入数据库 |
| `src/index.css` | 修改 | 全局 `box-sizing: border-box` + `overflow-x: hidden` |
| `src/components/PointsExchange.js` | 修改 | 卡片 hover 去掉上浮效果，只保留发光 |

**关键改动**：
- ForgotPassword：两步流程（确认邮箱存在 → 设置新密码），用 SweetAlert2 替代原生 alert，bcrypt 加密后更新数据库
- 横向溢出：全局 box-sizing 修复 width+padding 导致的宽度溢出
- 方案 A（Supabase Auth 邮件重置）已记录到开发计划 Phase 3.4，后续执行

---

## [2026-04-17] Phase 2 Step 9 — 代码质量清理

**目标**：统一代码规范，清理冗余代码

**改动文件**：

| 文件 | 改动 |
|---|---|
| `src/components/ContractTutorial.js` | 删除 4 处纯调试 console.log，移除 JS 动态注入 style 标签 |
| `src/components/Components.css` | 新增 `.markdown-content img` 公共样式 |
| `src/Login.js` / `Register.js` / `ForgotPassword.js` / `userStore.js` | supabase 导入统一为 named import |
| `src/services/supabaseClient.js` | 删除 default export |
| `src/App.js` | 移除 ContentManagement import |
| `src/Register.js` | 3 处原生 alert → SweetAlert2 |
| `package.json` | 移除 lightweight-charts、date-fns、axios、animate.css |

**保留项**：catch 块中的 console.error 保留（便于后续调试排错）

---

## [2026-04-17] 代码审查记录

在项目分析文档（第十二章）和开发计划中记录了 17 项代码审查问题，按 P0-P3 分级。
未投入生产前暂不紧急，后续按开发计划逐步修复。

---
