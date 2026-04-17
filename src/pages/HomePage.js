import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    link: 'https://docs.google.com/document/d/1rjj-2mnlccLuymckGrW5txIZX8Mpv4f_mbh1IeJ1kZ8/edit?usp=sharing',
  },
];

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (document.getElementById('hp-particles-js').children.length > 0) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
    script.async = true;
    script.onload = () => {
      if (window.particlesJS) {
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
    };
    document.body.appendChild(script);
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
          <button onClick={() => scrollTo('tutorials')}>新手教学</button>
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
            <a
              className="hp-tutorial-card"
              key={i}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <span className="hp-tutorial-link">查看教程 →</span>
            </a>
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
        <p>© 2026 GHOST. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
