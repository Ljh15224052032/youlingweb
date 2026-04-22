import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/context';
import './HomePage.css';

const TypewriterText = ({ text, speed = 120, pause = 2000, deleteSpeed = 60 }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let i = 0;
    let current = '';
    let timers = [];

    setDisplay('');

    const typeTimer = setInterval(() => {
      i++;
      current = text.slice(0, i);
      setDisplay(current);
      if (i >= text.length) {
        clearInterval(typeTimer);
        const pauseTimer = setTimeout(() => {
          const deleteTimer = setInterval(() => {
            i--;
            current = text.slice(0, i);
            setDisplay(current);
            if (i <= 0) {
              clearInterval(deleteTimer);
              setDisplay('');
            }
          }, deleteSpeed);
          timers.push(deleteTimer);
        }, pause);
        timers.push(pauseTimer);
      }
    }, speed);
    timers.push(typeTimer);

    return () => { timers.forEach(t => clearInterval(t) || clearTimeout(t)); };
  }, [text, speed, pause, deleteSpeed]);

  return (
    <span>
      {display}
      <span className="typewriter-cursor">|</span>
    </span>
  );
};

const LogoIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 220 220" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M75 109.5L13 19H71L108.5 73.5L146 19H197L134 109.5V187H169.5L202.5 166.5V206.5H75V109.5ZM101.5 82.5L90.5 99.5V194.5L81 199.5L79.5 99.5L31 28.5H66.5L101.5 82.5Z" fill="url(#logo-grad)"/>
    <defs>
      <linearGradient id="logo-grad" x1="202" y1="206" x2="108" y2="17" gradientUnits="userSpaceOnUse">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="#FFC107"/>
      </linearGradient>
    </defs>
  </svg>
);

const featureIcons = [
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#bfa14a" opacity="0.2" />
    <path d="M12 6v6l4 2" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="#ffd700" />
  </svg>,
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="3" fill="#bfa14a" opacity="0.2" />
    <path d="M8 8h8v2H8zm0 4h6v2H8z" fill="#ffd700" />
  </svg>,
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <rect x="6" y="3" width="12" height="18" rx="2" fill="#bfa14a" opacity="0.2" />
    <path d="M9 7h6M9 11h6M9 15h3" stroke="#ffd700" strokeWidth="2" />
  </svg>,
];

const tutorials = [];

function HomePage() {
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const featureKeys = ['Airdrop', 'Newbie', 'Contract'];
  const features = featureKeys.map((key, i) => ({
    icon: featureIcons[i],
    title: t(`home.feature${key}`),
    desc: t(`home.feature${key}Desc`),
  }));

  const leftTrackRef = useRef(null);
  const rightTrackRef = useRef(null);
  const marqueeState = useRef({
    leftTarget: 40, rightTarget: 37,
    leftSpeed: 40, rightSpeed: 37,
    leftPos: 0, rightPos: 0,
    rightInit: false,
  });

  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const s = marqueeState.current;
      const t = 1 - Math.exp(-4 * dt);

      const leftTrack = leftTrackRef.current;
      const rightTrack = rightTrackRef.current;

      if (leftTrack) {
        s.leftSpeed += (s.leftTarget - s.leftSpeed) * t;
        s.leftPos -= s.leftSpeed * dt;
        const hw = leftTrack.scrollWidth / 2;
        if (hw > 0 && s.leftPos <= -hw) s.leftPos += hw;
        leftTrack.style.transform = `translateX(${s.leftPos}px)`;
      }

      if (rightTrack) {
        if (!s.rightInit) {
          const hw = rightTrack.scrollWidth / 2;
          if (hw > 0) { s.rightPos = -hw; s.rightInit = true; }
        }
        s.rightSpeed += (s.rightTarget - s.rightSpeed) * t;
        s.rightPos += s.rightSpeed * dt;
        const hw = rightTrack.scrollWidth / 2;
        if (hw > 0 && s.rightPos >= 0) s.rightPos -= hw;
        rightTrack.style.transform = `translateX(${s.rightPos}px)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMarqueeEnter = (key) => {
    if (key === 'left') marqueeState.current.leftTarget = 16;
    else marqueeState.current.rightTarget = 15;
  };
  const handleMarqueeLeave = (key) => {
    if (key === 'left') marqueeState.current.leftTarget = 40;
    else marqueeState.current.rightTarget = 37;
  };
  const handleWordClick = (e) => {
    const el = e.target;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 600);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyWechat = () => {
    navigator.clipboard.writeText('admiraltyz');
    const tip = document.getElementById('wechat-copy-tip');
    if (tip) {
      tip.textContent = lang === 'zh' ? '已复制' : 'Copied';
      setTimeout(() => { tip.textContent = t('home.wechatTip'); }, 1500);
    }
  };

  return (
    <div className="homepage">
      {/* 导航栏 */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">GHOST <LogoIcon size={28} /></div>
        <div className="hp-nav-links">
          <button onClick={() => scrollTo('hero')}>{t('home.navHome')}</button>
          <button onClick={() => navigate('/docs')}>{t('home.navDocs')}</button>
        </div>
        <div className="hp-nav-actions">
          <button className="hp-btn-outline" onClick={() => navigate('/login')}>{t('home.login')}</button>
          <button className="hp-btn-gold" onClick={() => navigate('/register')}>{t('home.register')}</button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section id="hero" className="hp-hero">
        <img className="hp-hero-bg-img" src="/images/background.png" alt="" />
        <div className="hp-hero-content">
          <h1 className="hp-hero-title">GHOST <span className="hp-hero-logo"><LogoIcon size={96} /></span></h1>
          <p className="hp-hero-subtitle">
            <TypewriterText text={t('home.heroSubtitle')} />
          </p>
          <p className="hp-hero-desc">
            {t('home.heroDesc')}
          </p>
          <div className="hp-hero-buttons">
            <button className="hp-btn-gold hp-btn-lg" onClick={() => navigate('/register')}>
              {t('home.joinNow')}
            </button>
            <button className="hp-btn-outline hp-btn-lg" onClick={() => scrollTo('features')}>
              {t('home.learnMore')}
            </button>
          </div>
        </div>
        <div className="hp-hero-glow" />
      </section>

      {/* 功能亮点 */}
      <section id="features" className="hp-section">
        <h2 className="hp-section-title">{t('home.sectionFeatures')}</h2>
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

      {/* 滚动字幕墙 */}
      <section className="hp-marquee-section">
        <div className="hp-marquee-row" onMouseEnter={() => handleMarqueeEnter('left')} onMouseLeave={() => handleMarqueeLeave('left')}>
          <div ref={leftTrackRef} className="hp-marquee-track">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {t('home.marqueeRow1').split(/\s+/).map((word, j) => (
                  <span key={j} className="hp-marquee-word" onClick={handleWordClick}>{word}</span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="hp-marquee-row" onMouseEnter={() => handleMarqueeEnter('right')} onMouseLeave={() => handleMarqueeLeave('right')}>
          <div ref={rightTrackRef} className="hp-marquee-track">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {t('home.marqueeRow2').split(/\s+/).map((word, j) => (
                  <span key={j} className="hp-marquee-word" onClick={handleWordClick}>{word}</span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 学习 Banner */}
      <section className="hp-banner-section">
        <div className="hp-banner-wrap">
          <div className="hp-banner-card">
            <img src="/images/web3-abstract.jpg" alt="" className="hp-banner-img" />
            <div className="hp-banner-gradient" />
            <div className="hp-banner-content">
              <div className="hp-banner-text">
                <h3 className="hp-banner-title">
                  {t('home.bannerTitle')} <span className="hp-banner-highlight">{t('home.bannerHighlight')}</span>
                </h3>
                <p className="hp-banner-desc">{t('home.bannerDesc')}</p>
                <button className="hp-banner-btn" onClick={() => navigate('/docs')}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                  </svg>
                  {t('home.startLearning')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <h2>{t('home.ctaTitle')}</h2>
        <p>{t('home.ctaDesc')}</p>
        <button className="hp-btn-gold hp-btn-lg" onClick={() => navigate('/register')}>
          {t('home.freeRegister')}
        </button>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-social-icons">
          <div className="hp-social-icon wechat" style={{ cursor: 'pointer' }} onClick={copyWechat}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.42 6.42 0 01-.246-1.79c0-3.558 3.39-6.451 7.585-6.451.258 0 .509.025.764.042C16.672 4.627 13.034 2.188 8.691 2.188zm-2.35 4.477a.97.97 0 110 1.94.97.97 0 010-1.94zm5.321 0a.97.97 0 110 1.94.97.97 0 010-1.94zM23.997 15.39c0-3.248-3.236-5.882-7.229-5.882-3.992 0-7.228 2.634-7.228 5.882 0 3.248 3.236 5.882 7.228 5.882.79 0 1.55-.103 2.275-.289a.69.69 0 01.574.078l1.525.89a.26.26 0 00.133.044c.13 0 .232-.105.232-.236 0-.058-.023-.114-.039-.17l-.312-1.186a.472.472 0 01.171-.532c1.462-1.075 2.39-2.648 2.39-4.39zm-9.725-1.357a.78.78 0 110 1.56.78.78 0 010-1.56zm4.993 0a.78.78 0 110 1.56.78.78 0 010-1.56z"/></svg>
            <span id="wechat-copy-tip" className="hp-social-tooltip">{t('home.wechatTip')}</span>
          </div>
          <div className="hp-social-icon official-account">
            <a href="https://mp.weixin.qq.com/s/UZh1RVopTsJ6NntoGnRAvA" target="_blank" rel="noopener noreferrer" className="hp-social-link">
              <svg viewBox="0 0 1024 1024" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88zM448.18432 230.94272c176.98304-53.95968 267.17696 110.98624 267.17696 110.98624-32.59392-17.78176-130.39104-37.53472-235.09504 16.7936s-126.4384 172.87168-126.4384 172.87168c-42.56256-45.4144-44.4928-118.6304-44.4928-118.6304 5.03296-137.41568 138.84928-182.02112 138.84928-182.02112zM393.50784 796.42112c-256.12288-49.6384-197.85216-273.38752-133.81632-371.95264 0 0-2.88256 138.13248 130.22208 214.4 0 0 15.82592 7.1936 10.79296 30.21312l-5.03808 29.49632s-6.656 20.1472 6.02624 22.30272c0 0 4.04992 0 13.39904-6.4768l48.92672-32.37376s10.07104-7.1936 23.01952-5.03808c12.94848 2.16064 95.68768 23.74656 177.70496-44.60032-0.00512 0-15.10912 213.67296-271.23712 164.02944z m256.8448-19.42016c16.54784-7.9104 97.1264-102.8864 58.98752-231.66464s-167.6288-157.55776-167.6288-157.55776c66.19136-28.0576 143.89248-7.19872 143.89248-7.19872 117.9904 34.5344 131.6608 146.77504 131.6608 146.77504 23.01952 200.71936-166.912 249.64608-166.912 249.64608z" fill="currentColor"/></svg>
              <span className="hp-social-tooltip">{t('home.officialAccountTip')}</span>
            </a>
          </div>
        </div>
        <p>{t('home.copyright')}</p>
      </footer>
    </div>
  );
}

export default HomePage;
