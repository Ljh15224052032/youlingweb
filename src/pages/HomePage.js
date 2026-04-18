import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'particles.js';
import { supabase } from '../services/supabaseClient';
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
  const [guides, setGuides] = useState([]);

  const featureKeys = ['Airdrop', 'Newbie', 'Contract'];
  const features = featureKeys.map((key, i) => ({
    icon: featureIcons[i],
    title: t(`home.feature${key}`),
    desc: t(`home.feature${key}Desc`),
  }));

  useEffect(() => {
    supabase
      .from('newbie_guides')
      .select('id, title, category, cover_image')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setGuides(data); });
  }, []);

  useEffect(() => {
    if (window.particlesJS && document.getElementById('hp-particles-js')) {
      window.particlesJS('hp-particles-js', {
        particles: {
          number: { value: 40, density: { enable: true, value_area: 1200 } },
          color: { value: '#bfa14a' },
          shape: { type: 'circle' },
          opacity: { value: 0.3, random: true },
          size: { value: 2, random: true },
          line_linked: { enable: true, distance: 150, color: '#bfa14a', opacity: 0.15, width: 1 },
          move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out' }
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
      <div id="hp-particles-js" className="hp-page-particles" />
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
        <svg className="hp-hero-bg-svg" viewBox="0 0 297 235" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M116 0C127.331 0 138.282 1.62627 148.634 4.65527C155.871 3.24161 163.349 2.5 171 2.5C228.978 2.5 277.019 45.0344 285.626 100.601C292.038 101.401 297 106.871 297 113.5C297 119.737 292.607 124.948 286.746 126.208C282.779 186.679 232.475 234.5 171 234.5C159.669 234.5 148.717 232.873 138.365 229.844C131.128 231.257 123.651 232 116 232C51.935 232 0 180.065 0 116C3.8656e-07 51.935 51.935 3.8666e-07 116 0ZM157.276 7.94727L178.232 18.4248L186.689 24.8916L194.651 31.8594L209.095 46.7998L221.046 68.2129L229.511 91.1172L230.254 96.8145L231 102.541L231.499 114L230.502 136.916L223.534 159.811L212.083 181.22L199.142 197.147L182.221 211.58L149.779 227.552L148.243 228.308L149.944 228.497L172.506 231.004L172.566 230.996L195.066 227.996L195.107 227.99L195.147 227.978L208.147 223.978L208.175 223.97L208.201 223.958L220.701 218.458L220.725 218.447L220.746 218.436L232.246 211.936L232.271 211.921L232.294 211.904L243.326 203.881L253.875 193.332L253.894 193.309L262.894 181.809L262.913 181.784L262.929 181.757L271.929 166.757L271.953 166.716L271.97 166.671L277.97 150.171L277.98 150.142L277.987 150.11L280.487 139.11L280.491 139.097L280.493 139.082L281.5 133.041V127.276L281.333 127.127L279.892 125.837C276.477 124.7 273.692 122.185 272.196 118.952L272.021 118.795L272.038 118.599C271.37 117.033 271 115.31 271 113.5C271 107.193 275.491 101.935 281.45 100.75L278.483 89.374L278.479 89.3574L278.475 89.3418L274.475 77.3418L274.463 77.3105L269.963 66.3105L269.945 66.2666L269.919 66.2275L263.419 56.2275L263.413 56.2178L263.406 56.208L254.406 43.708L254.373 43.6621L254.331 43.626L241.331 32.126L241.313 32.1094L241.293 32.0947L226.793 21.5947L226.76 21.5713L226.724 21.5527L210.681 13.5312L210.635 13.5186L198.135 10.0186L198.126 10.0156L198.116 10.0137L185.616 7.01367L185.56 7H157.5L157.276 7.94727ZM148.434 9.57617C96.8968 19.629 58 65.0213 58 119.5C58 169.71 91.0405 212.203 136.565 226.424C188.103 216.371 227 170.979 227 116.5C227 66.2893 193.959 23.7965 148.434 9.57617ZM127 47.4814C139.912 45.6224 139.005 46.9739 139 46.9814L140 64.9814C140 64.9814 141.357 66.4751 142.5 66.9814C144.65 67.9336 147.627 68.6645 148.5 66.4814C150.5 61.4814 149.5 46.9814 149.5 46.9814H161.5C161.5 46.9814 160.72 59.7515 162.5 65.4814C163.806 69.6862 178.5 70.4815 182.5 73.4814C186.5 76.4814 190.857 80.623 192 87.4814C193.147 94.3645 189.5 101.981 185.5 106.481L182.5 109.481C182.29 111.487 189.296 113.742 191 114.981C196.492 118.976 197.996 127.955 198 127.981C198 127.981 198.5 139.481 195 145.481C190.452 153.278 186.07 155.071 178.5 158.481C171.653 161.566 160.006 161.981 160 161.981V181.981H148.5L147 179.981V165.481C147 163.981 146.5 163.481 145 162.481H138.5C137 163.481 137.5 164.981 137.5 166.481V181.981H127L125 179.981L124.5 164.481C124.5 162.981 123.5 161.981 122.5 161.481C121.5 160.981 103.5 159.981 103.5 159.981L101 158.481L102.5 146.981L114 145.981L115.5 143.981L117 86.4814C117 76.4862 103.512 77.9801 103.5 77.9814L101.5 76.4814V66.4814H125.5C128.001 60.1449 127.251 55.0941 127 47.4814ZM137.5 145.481L139.5 146.981H158C163.5 145.481 166.5 144.481 170.5 140.481C172.5 137.481 173 134.981 172.5 131.481C171 124.981 166.5 122.981 160 120.981C152 119.481 147 119.481 138.5 119.481L137.5 145.481ZM139 82.9814L138.5 106.481H158L164 102.981L166.5 100.981L167.5 98.4814L168 94.9814L167 89.9814L165.5 87.4814L163 84.9814C159.5 83.4814 157 82.4814 151.5 81.9814L139.5 80.9814L139 82.9814Z" fill="url(#hp-hero-bg-grad)"/>
          <defs>
            <linearGradient id="hp-hero-bg-grad" x1="83" y1="8.49999" x2="166.5" y2="179" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8EB83"/>
              <stop offset="1" stopColor="#BDA938"/>
            </linearGradient>
          </defs>
        </svg>
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

      {/* 新手教学 */}
      <section id="tutorials" className="hp-section hp-section-dark">
        <div className="hp-tutorials-layout">
          <div className="hp-tutorials-cards">
            {guides.length > 0 ? guides.map((g) => (
              <div
                className="hp-tutorial-card"
                key={g.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/docs')}
              >
                {g.cover_image && (
                  <div className="hp-tutorial-cover" style={{ backgroundImage: `url(${g.cover_image})` }} />
                )}
                <div className="hp-tutorial-info">
                  {g.category && <span className="hp-tutorial-tag">{g.category}</span>}
                  <h3>{g.title}</h3>
                  <span className="hp-tutorial-link">{t('home.readMore')}</span>
                </div>
              </div>
            )) : (
              <div className="hp-tutorial-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/docs')}>
                <h3>{t('home.defaultTutorialTitle')}</h3>
                <p>{t('home.defaultTutorialDesc')}</p>
                <span className="hp-tutorial-link">{t('home.viewTutorial')}</span>
              </div>
            )}
          </div>
          <div className="hp-tutorials-intro">
            <h2 className="hp-section-title">{t('home.sectionTutorials')}</h2>
            <p className="hp-section-desc">{t('home.tutorialsDesc')}</p>
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
          <div className="hp-social-icon wechat" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('admiraltyz'); const tip = document.getElementById('wechat-copy-tip'); if (tip) { tip.textContent = lang === 'zh' ? '已复制' : 'Copied'; setTimeout(() => { tip.textContent = t('home.wechatTip'); }, 1500); } }}>
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
