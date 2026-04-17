import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { marked } from "marked";
import Swal from "sweetalert2";

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

const categories = [...new Set(docs.map((d) => d.category))];

const sidebarGroups = categories.map((cat) => ({
  category: cat,
  items: docs.filter((d) => d.category === cat),
}));

function DocsContent({ doc }) {
  if (!doc) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📖</div>
        <p>选择左侧文档开始阅读</p>
      </div>
    );
  }

  const html = marked.parse(doc.content, { breaks: true, gfm: true });

  const handleClick = (e) => {
    if (e.target.tagName !== 'IMG') return;

    const container = e.currentTarget;
    const images = Array.from(container.querySelectorAll('img'));
    const index = images.indexOf(e.target);
    if (index === -1) return;

    const showImage = (i) => {
      const imgEl = document.getElementById('docs-lightbox-img');
      const counter = document.getElementById('docs-lightbox-counter');
      if (imgEl) imgEl.src = images[i].src;
      if (counter) counter.textContent = images.length > 1 ? `${i + 1} / ${images.length}` : '';
      document.getElementById('docs-lightbox-prev').style.display = i > 0 ? 'block' : 'none';
      document.getElementById('docs-lightbox-next').style.display = i < images.length - 1 ? 'block' : 'none';
      document.getElementById('docs-lightbox-img').dataset.index = i;
    };

    Swal.fire({
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;height:80vh">
          <button id="docs-lightbox-prev" style="position:absolute;left:0;background:rgba(191,161,74,0.15);border:none;color:#ffd700;font-size:2rem;padding:0.5rem 1rem;cursor:pointer;border-radius:8px;display:${index > 0 ? 'block' : 'none'}">‹</button>
          <img id="docs-lightbox-img" src="${images[index].src}" data-index="${index}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px" />
          <button id="docs-lightbox-next" style="position:absolute;right:0;background:rgba(191,161,74,0.15);border:none;color:#ffd700;font-size:2rem;padding:0.5rem 1rem;cursor:pointer;border-radius:8px;display:${index < images.length - 1 ? 'block' : 'none'}">›</button>
          <div id="docs-lightbox-counter" style="position:absolute;bottom:-30px;color:rgba(255,255,255,0.5);font-size:0.85rem">${images.length > 1 ? `${index + 1} / ${images.length}` : ''}</div>
        </div>
      `,
      background: 'transparent',
      backdrop: 'rgba(0,0,0,0.85)',
      showCloseButton: true,
      showConfirmButton: false,
      width: '90%',
      didOpen: () => {
        document.getElementById('docs-lightbox-prev').onclick = () => {
          const cur = parseInt(document.getElementById('docs-lightbox-img').dataset.index);
          if (cur > 0) showImage(cur - 1);
        };
        document.getElementById('docs-lightbox-next').onclick = () => {
          const cur = parseInt(document.getElementById('docs-lightbox-img').dataset.index);
          if (cur < images.length - 1) showImage(cur + 1);
        };
      },
    });
  };

  return (
    <div className="docs-content" onClick={handleClick}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function DocsPage() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const currentDoc = docs.find((d) => d.id === docId) || docs[0];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#181a20",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部栏 */}
      <header
        style={{
          height: "56px",
          padding: "0 1.5rem",
          background: "rgba(24,24,26,0.95)",
          borderBottom: "1px solid rgba(191,161,74,0.2)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
            className="docs-mobile-menu-btn"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#ffd700"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#ffd700",
              fontSize: "1.2rem",
              fontWeight: 700,
              letterSpacing: "2px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <span>📖</span> GHOST 文档中心
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "rgba(191,161,74,0.1)",
            border: "1px solid rgba(191,161,74,0.3)",
            color: "#bfa14a",
            padding: "0.4rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          ← 返回首页
        </button>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* 移动端遮罩 */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 90,
            }}
          />
        )}

        {/* 左侧目录 */}
        <aside
          className="docs-sidebar"
          style={{
            width: "280px",
            minHeight: 0,
            borderRight: "1px solid rgba(191,161,74,0.1)",
            background: "rgba(20,20,24,0.6)",
            position: mobileMenuOpen ? "fixed" : "relative",
            left: mobileMenuOpen ? 0 : undefined,
            top: mobileMenuOpen ? "56px" : undefined,
            zIndex: mobileMenuOpen ? 100 : undefined,
            height: mobileMenuOpen ? "calc(100vh - 56px)" : undefined,
            display: mobileMenuOpen ? "block" : undefined,
          }}
        >
          <SimpleBar style={{ height: "calc(100vh - 56px)" }}>
            <div style={{ padding: "1.5rem 0" }}>
              {sidebarGroups.map((group) => (
                <div key={group.category} style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      padding: "0 1.5rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.3)",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {group.category}
                  </div>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/docs/${item.id}`);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        padding: "0.6rem 1.5rem",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color:
                          currentDoc?.id === item.id
                            ? "#ffd700"
                            : "rgba(255,255,255,0.6)",
                        background:
                          currentDoc?.id === item.id
                            ? "rgba(191,161,74,0.1)"
                            : "transparent",
                        borderRight:
                          currentDoc?.id === item.id
                            ? "3px solid #ffd700"
                            : "3px solid transparent",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (currentDoc?.id !== item.id) {
                          e.currentTarget.style.background =
                            "rgba(191,161,74,0.05)";
                          e.currentTarget.style.color = "#bfa14a";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentDoc?.id !== item.id) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        }
                      }}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SimpleBar>
        </aside>

        {/* 右侧内容 */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: "calc(100vh - 56px)", overflowY: "auto" }}>
            <div
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "2.5rem 2rem",
              }}
            >
              <DocsContent doc={currentDoc} />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .docs-content h1 {
          font-size: 1.8rem;
          color: #ffd700;
          margin: 0 0 1.5rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid rgba(191,161,74,0.2);
        }
        .docs-content h2 {
          font-size: 1.3rem;
          color: #fff;
          margin: 2rem 0 1rem;
          padding-left: 0.8rem;
          border-left: 3px solid #bfa14a;
        }
        .docs-content h3 {
          font-size: 1.1rem;
          color: #eee;
          margin: 1.5rem 0 0.8rem;
        }
        .docs-content p {
          color: rgba(255,255,255,0.75);
          line-height: 1.8;
          margin: 0.8rem 0;
          font-size: 0.95rem;
        }
        .docs-content a {
          color: #ffd700;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,215,0,0.3);
          transition: border-color 0.2s;
          word-break: break-all;
        }
        .docs-content a:hover {
          border-bottom-color: #ffd700;
        }
        .docs-content strong {
          color: #ffd700;
          font-weight: 600;
        }
        .docs-content code {
          background: rgba(191,161,74,0.1);
          color: #ffd700;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .docs-content blockquote {
          border-left: 3px solid rgba(191,161,74,0.3);
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          background: rgba(191,161,74,0.05);
          border-radius: 0 8px 8px 0;
        }
        .docs-content blockquote p {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
        }
        .docs-content ol, .docs-content ul {
          padding-left: 1.5rem;
          margin: 0.8rem 0;
        }
        .docs-content li {
          color: rgba(255,255,255,0.75);
          line-height: 2;
          font-size: 0.95rem;
        }
        .docs-content hr {
          border: none;
          border-top: 1px solid rgba(191,161,74,0.15);
          margin: 2rem 0;
        }
        .docs-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem auto;
          display: block;
          min-height: 200px;
          background: rgba(191,161,74,0.05);
          object-fit: contain;
          cursor: zoom-in;
        }
        .docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .docs-content th, .docs-content td {
          border: 1px solid rgba(191,161,74,0.15);
          padding: 0.6rem 1rem;
          text-align: left;
        }
        .docs-content th {
          background: rgba(191,161,74,0.1);
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .docs-sidebar {
            display: none !important;
          }
          .docs-sidebar[style*="fixed"] {
            display: block !important;
          }
          .docs-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default DocsPage;
