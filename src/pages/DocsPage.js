import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { safeMarkdown } from "../utils/sanitize";
import { handleWechatLinkClick } from "../utils/wechatLink";
import { useLang } from "../i18n/context";
import "./DocsPage.css";

// ── 文档数据 ──────────────────────────────
const docs = [
  {
    id: "download-binance",
    title: "如何下载币安 App",
    category: "交易所教程",
    content: `
# 如何下载币安 App

> 邀请码：**738205337**

---

## 安卓用户

点击主站链接，下载并安装即可：

- 免翻域名：https://www.bsmkweb.cc/join?ref=738205337

---

## iOS 苹果用户

下载地址：https://www.marketwebb.me/zh-CN/downloadTips

> **切换 ID 免翻域名**

:::warning
⚠️ **注意**：在大陆 AppStore 搜索到的币安 App 大概率是假的，**千万不要下载！**
:::

---

## 华为手机下载方式

**安装方式一**（推荐）：

https://download-1306379396.file.myqcloud.com/pack/Binance.apk

**安装方式二**：

1. 打开华为商城
2. 切换国家为「迪拜/英国」
3. 搜索「**Binance**」
4. 下载安装
![下载币安](/images/download-binance-1.jpg)
`,
  },
  {
    id: "kyc-verification",
    title: "KYC 实名认证",
    category: "交易所教程",
    content: `
# 为什么要做 KYC 实名认证？

不完成 KYC，将受限于 **C2C 交易**、**Launchpad 参与**、**提币额度**等功能。

---

## 如何完成 KYC 实名认证？

### 手机端操作

1. 登录币安 App，点击左上角头像
2. 点击「认证」，进入身份验证流程
3. 上传身份证件 + 进行人脸识别

### 网页端教程

https://www.binance.com/zh-CN/support/faq/detail/360027287111

> 认证完成后即可解锁 C2C 交易与高额度功能。
![KYC认证](/images/kyc-verification-1.jpg)
![KYC认证](/images/kyc-verification-2.jpg)
`,
  },
  {
    id: "c2c-trading",
    title: "C2C 交易教程",
    category: "交易所教程",
    content: `
# C2C 交易教程

## 一、什么是 C2C 交易？

C2C 交易（又名法币交易）指使用 **人民币** 购买 / 出售数字货币。

官方介绍：https://www.binance.com/zh-CN/support/faq/%E4%B9%B0%E5%B8%81?c=66&navld=66#67-68

---

## 二、教学视频

**手机端买币教程**：https://www.binance.com/zh-CN/support/articles/360039384951

**网页端买币教程**：https://www.binance.com/zh-CN/support/articles/360043832851

---

## 三、C2C 交易付款注意事项

为了账户资金安全，务必遵守以下操作规范：

1. **已转账后不要点「取消交易」**，除非卖家已退款
2. **未付款不要点「确认付款」**，否则可能被冻结
3. **付款需手动进行**，点击「去支付」并不会自动转账
4. 若页面未显示卖家广告，请检查是否选择了 **【人民币 CNY】**

---

## 四、注册不满 7 天的用户提示

某些 C2C 商家设置了「注册时间门槛」，若遇无法交易情况，可以：

- 选择其他广告商
- 或使用「快捷区」进行「一键买币」

---

## 五、如何卖币提现成人民币？

**App 教程**：https://www.binance.com/zh-CN/support/faq/360039385091

**网页端教程**：https://www.binance.com/zh-CN/support/faq/360041106311

---

## 六、提现前必须等待 24 小时的原因

为防止资金冻结，购买加密资产后需 **等待 24 小时** 才能提现。
![C2C交易](/images/c2c-trading-1.jpg)
`,
  },
  {
    id: "deposit-withdraw",
    title: "充值与提现",
    category: "交易所教程",
    content: `
# 充值与提现的方式

## 充值方式

除了 C2C 购买之外，也可将其他平台的加密资产充值到币安。

**数字货币充值与提现视频教学**：

https://www.binance.com/zh-CN/support/faq/%E5%85%85%E5%80%BC%E4%B8%8E%E6%8F%90%E5%B8%81%E6%96%B0%E6%89%8B%E6%8C%87%E5%BC%951-85a1c394ac1d489fb0bfac0ef2fceafd

> ⚠️ **注意**：大陆用户不支持充值法币，仅支持 C2C 买币充值。
![充值提现1](/images/deposit-withdraw-1.jpg)
![充值提现2](/images/deposit-withdraw-2.jpg)
`,
  },
  {
    id: "spot-trading",
    title: "现货交易实操",
    category: "交易所教程",
    content: `
# 现货交易实操教学

课程分为三部分：

1. 划转资产到现货账户
2. 币币现货交易
3. 设置止盈止损单

---

## 一、如何进行账户划转？

在使用人民币购买了 USDT 后，需将其从 **法币账户** 划转至 **现货账户** 才能用于币币交易。

**操作步骤：**

1. 打开 App 并登录账户
2. 点击「资金」标签，选择「C2C 账户」
3. 点击「转账」→ 选择「划转」
4. 设置转出账户、币种与金额，点击「划转」
5. 可点击右上角「历史」查看记录

---

## 二、币币现货交易操作指南

**币币交易**：使用一种数字货币（如 USDT）购买另一种币（如 BTC、ETH 等）

**视频教程：**

- 币币交易操作步骤：https://www.binance.com/zh-CN/support/articles/115003765031
- App 端操作教程：https://www.binance.com/zh-CN/support/faq/c0669862a9e743d781c067c14106c29a

### 交易手续费说明

可以在币安平台交易手续费页面查看详细费率。

### 挂单与吃单的区别

| 类型 | 说明 | 通俗理解 |
|---|---|---|
| **Maker（挂单）** | 订单以非市价挂入市场，等待他人成交 | "我 18U 买 BTC"，等别人来卖 |
| **Taker（吃单）** | 接受市场已有订单，立即成交 | 别人说"我 18U 卖 BTC"，你直接买了 |

---

## 三、止盈止损功能详解

**区别于普通限价单：**

- **限价单**：设好价格挂单，但可能因滑点或深度不足不成交
- **止盈止损单**：触发价 + 限价组合，当价格达到触发价才挂出订单，更灵活应对行情剧烈波动

**示例：**

当前价格 17U，设置触发价 18U 限价卖出，系统在达到 18U 时才挂单，避免错失波动时机。
![止盈止损](/images/spot-trading-1.png)
`,
  },
  {
    id: "beginner-guide",
    title: "合约交易基础概念",
    category: "交易所教程",
    content: `
# 合约交易基础概念

合约交易的基础概念。

![合约交易1](/images/contract-trading-1.png)
![合约交易2](/images/contract-trading-2.jpg)
![合约交易3](/images/contract-trading-3.jpg)
![合约交易4](/images/contract-trading-4.jpg)
![合约交易5](/images/contract-trading-5.jpg)
`,
  },
  {
    id: "grid-bot",
    title: "网格机器人",
    category: "交易所教程",
    content: `

# 网格机器人

![网格机器人1](/images/grid-bot-1.jpg)
![网格机器人2](/images/grid-bot-2.jpg)
![网格机器人3](/images/grid-bot-3.jpg)
![网格机器人4](/images/grid-bot-4.jpg)
`,
  },
];

// ── SVG 图标 ──────────────────────────────
const FileTextIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="6" y="3" width="12" height="18" rx="2" fill="rgba(191,161,74,0.15)" />
    <path d="M9 7h6M9 11h6M9 15h3" stroke="#ffd700" strokeWidth="2" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── 工具函数 ──────────────────────────────
const getSummary = (content) =>
  content
    .replace(/[#*>`\[\]!()|]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 100);

// ── 文档内容组件（含灯箱） ────────────────
function DocsContent({ doc }) {
  if (!doc) return null;

  const html = safeMarkdown(doc.content);

  const handleClick = (e) => {
    handleWechatLinkClick(e);

    if (e.target.tagName !== "IMG") return;

    const container = e.currentTarget;
    const images = Array.from(container.querySelectorAll("img"));
    const index = images.indexOf(e.target);
    if (index === -1) return;

    const showImage = (i) => {
      const imgEl = document.getElementById("docs-lightbox-img");
      const counter = document.getElementById("docs-lightbox-counter");
      if (imgEl) imgEl.src = images[i].src;
      if (counter)
        counter.textContent =
          images.length > 1 ? `${i + 1} / ${images.length}` : "";
      document.getElementById("docs-lightbox-prev").style.display =
        i > 0 ? "block" : "none";
      document.getElementById("docs-lightbox-next").style.display =
        i < images.length - 1 ? "block" : "none";
      document.getElementById("docs-lightbox-img").dataset.index = i;
    };

    Swal.fire({
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;height:80vh;overflow:hidden">
          <button id="docs-lightbox-prev" style="position:absolute;left:0;top:50%;transform:translateY(-50%);z-index:2;background:rgba(191,161,74,0.15);border:none;color:#ffd700;font-size:2rem;padding:0.5rem 1rem;cursor:pointer;border-radius:8px;display:${index > 0 ? "block" : "none"}">&#8249;</button>
          <div id="docs-lightbox-wrap" style="overflow:hidden;max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;position:relative;width:100%;height:100%">
            <img id="docs-lightbox-img" src="${images[index].src}" data-index="${index}" data-scale="1" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;transition:none;cursor:grab;user-select:none" />
          </div>
          <button id="docs-lightbox-next" style="position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:2;background:rgba(191,161,74,0.15);border:none;color:#ffd700;font-size:2rem;padding:0.5rem 1rem;cursor:pointer;border-radius:8px;display:${index < images.length - 1 ? "block" : "none"}">&#8250;</button>
          <div id="docs-lightbox-counter" style="position:absolute;bottom:-30px;color:rgba(255,255,255,0.5);font-size:0.85rem">${images.length > 1 ? `${index + 1} / ${images.length}` : ""}</div>
          <div id="docs-lightbox-hint" style="position:absolute;top:-25px;color:rgba(255,255,255,0.3);font-size:0.75rem">滚轮缩放 · 拖拽移动 · 双击还原</div>
        </div>
      `,
      background: "transparent",
      backdrop: "rgba(0,0,0,0.85)",
      showCloseButton: true,
      showConfirmButton: false,
      width: "90%",
      didOpen: () => {
        const img = document.getElementById("docs-lightbox-img");
        let scale = 1;
        let tx = 0, ty = 0;
        let dragging = false, startX, startY;

        const applyTransform = () => {
          img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        };

        const resetView = () => {
          scale = 1; tx = 0; ty = 0;
          applyTransform();
        };

        img.addEventListener("wheel", (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          scale = Math.max(0.3, Math.min(5, scale * delta));
          applyTransform();
        });

        img.addEventListener("mousedown", (e) => {
          if (scale <= 1) return;
          dragging = true;
          startX = e.clientX - tx;
          startY = e.clientY - ty;
          img.style.cursor = "grabbing";
        });
        document.addEventListener("mousemove", (e) => {
          if (!dragging) return;
          tx = e.clientX - startX;
          ty = e.clientY - startY;
          applyTransform();
        });
        document.addEventListener("mouseup", () => {
          dragging = false;
          img.style.cursor = scale > 1 ? "grab" : "zoom-in";
        });

        img.addEventListener("dblclick", () => resetView());

        const showImageWithReset = (i) => {
          showImage(i);
          scale = 1; tx = 0; ty = 0;
          applyTransform();
        };

        document.getElementById("docs-lightbox-prev").onclick = () => {
          const cur = parseInt(img.dataset.index);
          if (cur > 0) showImageWithReset(cur - 1);
        };
        document.getElementById("docs-lightbox-next").onclick = () => {
          const cur = parseInt(img.dataset.index);
          if (cur < images.length - 1) showImageWithReset(cur + 1);
        };

        let lastTouchDist = 0;
        let touchDragging = false;
        let touchStartX = 0, touchStartY = 0;
        img.addEventListener("touchstart", (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            touchDragging = true;
            lastTouchDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY,
            );
            touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - tx;
            touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - ty;
          } else if (e.touches.length === 1 && scale > 1) {
            touchDragging = true;
            touchStartX = e.touches[0].clientX - tx;
            touchStartY = e.touches[0].clientY - ty;
          }
        }, { passive: false });
        img.addEventListener("touchmove", (e) => {
          if (!touchDragging) return;
          e.preventDefault();
          if (e.touches.length === 2) {
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY,
            );
            if (lastTouchDist > 0) {
              scale = Math.max(0.3, Math.min(5, scale * (dist / lastTouchDist)));
            }
            lastTouchDist = dist;
            tx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - touchStartX;
            ty = (e.touches[0].clientY + e.touches[1].clientY) / 2 - touchStartY;
            applyTransform();
          } else if (e.touches.length === 1 && scale > 1) {
            tx = e.touches[0].clientX - touchStartX;
            ty = e.touches[0].clientY - touchStartY;
            applyTransform();
          }
        }, { passive: false });
        img.addEventListener("touchend", (e) => {
          if (e.touches.length === 0) {
            touchDragging = false;
            lastTouchDist = 0;
          }
        });
      },
    });
  };

  return (
    <div className="docs-content" onClick={handleClick}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── 共享 Header ────────────────────────────
function DocsHeader({ navigate, t }) {
  return (
    <header className="docs-header">
      <div className="docs-header-left">
        <div className="docs-logo" onClick={() => navigate("/")}>
          GHOST
        </div>
      </div>
      <button className="docs-back-home" onClick={() => navigate("/")}>
        {t("docs.backToHome")}
      </button>
    </header>
  );
}

// ── 主页面组件 ──────────────────────────────
function DocsPage() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState(undefined);

  const selectedDoc = docId ? docs.find((d) => d.id === docId) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [docId]);

  const categories = [...new Set(docs.map((d) => d.category))];
  const filteredDocs = activeCategory
    ? docs.filter((d) => d.category === activeCategory)
    : docs;

  // ── 视图 B：文档详情 ────────────────────
  if (docId && selectedDoc) {
    const sameCategoryDocs = docs.filter((d) => d.category === selectedDoc.category);
    const currentIndex = sameCategoryDocs.findIndex((d) => d.id === selectedDoc.id);
    const prevDoc = currentIndex > 0 ? sameCategoryDocs[currentIndex - 1] : null;
    const nextDoc = currentIndex < sameCategoryDocs.length - 1 ? sameCategoryDocs[currentIndex + 1] : null;

    return (
      <div className="docs-page docs-detail-page">
        <DocsHeader navigate={navigate} t={t} />

        <div className="docs-detail-body">
          <img
            src="/images/membership-card.jpg"
            alt=""
            className="docs-bg-img"
          />
          <div className="docs-bg-overlay" />

          <div className="docs-detail-wrap">
            <button
              className="docs-back-link"
              onClick={() => navigate("/docs")}
            >
              <ArrowLeftIcon /> {t("docs.backToList")}
            </button>

            <div className="docs-detail-meta">
              <span className="docs-detail-category">
                {selectedDoc.category}
              </span>
            </div>

            <h1 className="docs-detail-title">{selectedDoc.title}</h1>

            <article className="docs-detail-article">
              <DocsContent doc={selectedDoc} />
            </article>

            {/* 上下篇导航 */}
            <div className="docs-nav-row">
              {prevDoc ? (
                <button
                  className="docs-nav-btn prev"
                  onClick={() => navigate(`/docs/${prevDoc.id}`)}
                >
                  <span className="docs-nav-label">{t("docs.prevDoc")}</span>
                  <span className="docs-nav-title">{prevDoc.title}</span>
                </button>
              ) : (
                <div className="docs-nav-spacer" />
              )}
              {nextDoc ? (
                <button
                  className="docs-nav-btn next"
                  onClick={() => navigate(`/docs/${nextDoc.id}`)}
                >
                  <span className="docs-nav-label">{t("docs.nextDoc")}</span>
                  <span className="docs-nav-title">{nextDoc.title}</span>
                </button>
              ) : (
                <div className="docs-nav-spacer" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 视图 A：文档列表 ────────────────────
  return (
    <div className="docs-page">
      <DocsHeader navigate={navigate} t={t} />

      {/* Banner */}
      <div className="docs-banner">
        <img
          src="/images/membership-card.jpg"
          alt=""
          className="docs-banner-img"
        />
        <div className="docs-banner-overlay" />
        <div className="docs-banner-glow" />
        <div className="docs-banner-content">
          <h1>{t("docs.bannerTitle")}</h1>
          <p>{t("docs.bannerDesc")}</p>
        </div>
      </div>

      {/* 主体 */}
      <main className="docs-main">
        <div className="docs-container">
          {/* 分类筛选 */}
          <div className="docs-filters">
            <button
              className={`docs-filter-btn${!activeCategory ? " active" : ""}`}
              onClick={() => setActiveCategory(undefined)}
            >
              {t("docs.all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`docs-filter-btn${activeCategory === cat ? " active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 卡片网格 */}
          <div className="docs-grid">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="docs-card"
                onClick={() => navigate(`/docs/${doc.id}`)}
              >
                <div className="docs-card-header">
                  <div className="docs-card-icon-wrap">
                    <FileTextIcon />
                  </div>
                  <span className="docs-card-arrow">
                    <ChevronRightIcon />
                  </span>
                </div>
                <h3 className="docs-card-title">{doc.title}</h3>
                <p className="docs-card-summary">{getSummary(doc.content)}</p>
                <div className="docs-card-footer">
                  <span className="docs-card-tag">{doc.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocsPage;
