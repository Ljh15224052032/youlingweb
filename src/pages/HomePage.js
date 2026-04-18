import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'particles.js';
import './HomePage.css';

const LogoIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 190 188" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M62 90.5L0 0H58L95.5 54.5L133 0H184L121 90.5V168H156.5L189.5 147.5V187.5H62V90.5ZM88.5 63.5L77.5 80.5V175.5L68 180.5L66.5 80.5L18 9.5H53.5L88.5 63.5Z"
      fill="url(#logo-grad)"
    />
    <defs>
      <linearGradient id="logo-grad" x1="189" y1="187" x2="95" y2="-2" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" />
        <stop offset="1" stopColor="#FFC107" />
      </linearGradient>
    </defs>
  </svg>
);

const features = [
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#bfa14a" opacity="0.2" />
        <path d="M12 6v6l4 2" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill="#ffd700" />
      </svg>
    ),
    title: '空投活动',
    desc: '精选优质空投项目，一站式参与，不错过每一个机会',
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#bfa14a" opacity="0.2" />
        <path d="M8 8h8v2H8zm0 4h6v2H8z" fill="#ffd700" />
      </svg>
    ),
    title: '新手教学',
    desc: '从零开始的 Web3 入门指南，手把手带你了解区块链世界',
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="18" rx="2" fill="#bfa14a" opacity="0.2" />
        <path d="M9 7h6M9 11h6M9 15h3" stroke="#ffd700" strokeWidth="2" />
      </svg>
    ),
    title: '合约教学',
    desc: '系统化合约交易教学，掌握专业交易策略与风控技巧',
  },
];

const tutorials = [
  {
    title: '新手入门完整教程',
    desc: '从零开始的 Web3 入门指南，涵盖区块链、钱包、交易所等核心知识',
    docId: 'download-binance',
  },
];

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.particlesJS && document.getElementById('hp-particles-js')) {
      window.particlesJS('hp-particles-js', {
          particles: {
            number: { value: 50, density: { enable: true, value_area: 900 } },
            color: { value: '#bfa14a' },
            shape: { type: 'circle' },
            opacity: { value: 0.4, random: true },
            size: { value: 2.5, random: true },
            line_linked: { enable: true, distance: 140, color: '#bfa14a', opacity: 0.25, width: 1 },
            move: { enable: true, speed: 1.5, direction: 'none', random: false, straight: false, out_mode: 'out' }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'repulse' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 3 }
            }
          },
          retina_detect: true
        });
    }
    return () => {
      const el = document.getElementById('hp-particles-js');
      if (el) el.innerHTML = '';
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      {/* 导航栏 */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">GHOST <LogoIcon size={28} /></div>
        <div className="hp-nav-links">
          <button onClick={() => scrollTo('hero')}>首页</button>
          <button onClick={() => navigate('/docs')}>新手教学</button>
        </div>
        <div className="hp-nav-actions">
          <button className="hp-btn-outline" onClick={() => navigate('/login')}>登录</button>
          <button className="hp-btn-gold" onClick={() => navigate('/register')}>注册</button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section id="hero" className="hp-hero">
        <div id="hp-particles-js" className="hp-hero-particles" />
        <div className="hp-hero-content">
          <h1 className="hp-hero-title">GHOST <span className="hp-hero-logo"><LogoIcon size={96} /></span></h1>
          <p className="hp-hero-subtitle">Web3 社群 · 空投活动 · 交易教学</p>
          <p className="hp-hero-desc">
            加入我们，获取最新的空投资讯、系统化的交易教学和专业的看盘工具
          </p>
          <div className="hp-hero-buttons">
            <button className="hp-btn-gold hp-btn-lg" onClick={() => navigate('/register')}>
              立即加入
            </button>
            <button className="hp-btn-outline hp-btn-lg" onClick={() => scrollTo('features')}>
              了解更多
            </button>
          </div>
        </div>
        <div className="hp-hero-glow" />
      </section>

      {/* 功能亮点 */}
      <section id="features" className="hp-section">
        <h2 className="hp-section-title">核心功能</h2>
        <div className="hp-features">
          {features.map((f, i) => (
            <div className="hp-feature-card" key={i}>
              <div className="hp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 新手教学 */}
      <section id="tutorials" className="hp-section hp-section-dark">
        <h2 className="hp-section-title">新手教学</h2>
        <p className="hp-section-desc">精选入门教程，从零开始了解 Web3 世界</p>
        <div className="hp-tutorials">
          {tutorials.map((t, i) => (
            <div
              className="hp-tutorial-card"
              key={i}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/docs/${t.docId || ''}`)}
            >
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <span className="hp-tutorial-link">查看教程 →</span>
            </div>
          ))}
        </div>
        <div className="hp-tutorials-note">
          <p>教程链接持续更新中，完整内容即将上线</p>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <h2>准备好开始了吗？</h2>
        <p>注册即可参与空投活动，获取最新教学资源</p>
        <button className="hp-btn-gold hp-btn-lg" onClick={() => navigate('/register')}>
          免费注册
        </button>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-social-icons">
          <div className="hp-social-icon wechat">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.42 6.42 0 01-.246-1.79c0-3.558 3.39-6.451 7.585-6.451.258 0 .509.025.764.042C16.672 4.627 13.034 2.188 8.691 2.188zm-2.35 4.477a.97.97 0 110 1.94.97.97 0 010-1.94zm5.321 0a.97.97 0 110 1.94.97.97 0 010-1.94zM23.997 15.39c0-3.248-3.236-5.882-7.229-5.882-3.992 0-7.228 2.634-7.228 5.882 0 3.248 3.236 5.882 7.228 5.882.79 0 1.55-.103 2.275-.289a.69.69 0 01.574.078l1.525.89a.26.26 0 00.133.044c.13 0 .232-.105.232-.236 0-.058-.023-.114-.039-.17l-.312-1.186a.472.472 0 01.171-.532c1.462-1.075 2.39-2.648 2.39-4.39zm-9.725-1.357a.78.78 0 110 1.56.78.78 0 010-1.56zm4.993 0a.78.78 0 110 1.56.78.78 0 010-1.56z"/></svg>
            <span className="hp-social-tooltip">微信号：admiraltyz</span>
          </div>
          <div className="hp-social-icon official-account">
            <a href="https://mp.weixin.qq.com/s/UZh1RVopTsJ6NntoGnRAvA" target="_blank" rel="noopener noreferrer" className="hp-social-link">
              <svg viewBox="0 0 1024 1024" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88zM448.18432 230.94272c176.98304-53.95968 267.17696 110.98624 267.17696 110.98624-32.59392-17.78176-130.39104-37.53472-235.09504 16.7936s-126.4384 172.87168-126.4384 172.87168c-42.56256-45.4144-44.4928-118.6304-44.4928-118.6304 5.03296-137.41568 138.84928-182.02112 138.84928-182.02112zM393.50784 796.42112c-256.12288-49.6384-197.85216-273.38752-133.81632-371.95264 0 0-2.88256 138.13248 130.22208 214.4 0 0 15.82592 7.1936 10.79296 30.21312l-5.03808 29.49632s-6.656 20.1472 6.02624 22.30272c0 0 4.04992 0 13.39904-6.4768l48.92672-32.37376s10.07104-7.1936 23.01952-5.03808c12.94848 2.16064 95.68768 23.74656 177.70496-44.60032-0.00512 0-15.10912 213.67296-271.23712 164.02944z m256.8448-19.42016c16.54784-7.9104 97.1264-102.8864 58.98752-231.66464s-167.6288-157.55776-167.6288-157.55776c66.19136-28.0576 143.89248-7.19872 143.89248-7.19872 117.9904 34.5344 131.6608 146.77504 131.6608 146.77504 23.01952 200.71936-166.912 249.64608-166.912 249.64608z" fill="currentColor"/></svg>
              <span className="hp-social-tooltip">关注公众号</span>
            </a>
          </div>
        </div>
        <p>© 2026 GHOST. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
