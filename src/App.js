import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthContainer from './AuthContainer';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import Airdrop from './components/Airdrop';
import NewbieGuide from './components/NewbieGuide';
import ContractTutorial from './components/ContractTutorial';
import UserProfile from './components/UserProfile';
import PointsExchange from './components/PointsExchange';
import useUserStore from './store/userStore';
import './App.css';

const LogoIcon = ({ size = 28 }) => (
  <svg width={size} height={size * 295 / 345} viewBox="0 0 345 295" fill="none">
    <path d="M143 32C154.331 32 165.282 33.6263 175.634 36.6553C182.871 35.2416 190.349 34.5 198 34.5C255.978 34.5 304.019 77.0344 312.626 132.601C319.038 133.401 324 138.871 324 145.5C324 151.737 319.607 156.948 313.746 158.208C309.779 218.679 259.475 266.5 198 266.5C186.669 266.5 175.717 264.873 165.365 261.844C158.128 263.257 150.651 264 143 264C78.935 264 27 212.065 27 148C27 83.935 78.935 32 143 32Z" fill="url(#logo-grad)"/>
    <defs>
      <linearGradient id="logo-grad" x1="110" y1="40.5" x2="193.5" y2="211" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E8EB83"/>
        <stop offset="1" stopColor="#BDA938"/>
      </linearGradient>
    </defs>
  </svg>
);

const icons = {
  airdrop: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bfa14a" opacity="0.3"/><path d="M12 7v5l4 2" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  newbie: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#bfa14a" opacity="0.3"/><path d="M8 8h8v2H8zm0 4h6v2H8z" fill="#ffd700"/></svg>
  ),
  contract: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" fill="#bfa14a" opacity="0.3"/><path d="M9 7h6M9 11h6M9 15h3" stroke="#ffd700" strokeWidth="2"/></svg>
  ),
  profile: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="#bfa14a" opacity="0.3"/><rect x="6" y="15" width="12" height="5" rx="2.5" fill="#bfa14a" opacity="0.3"/></svg>
  ),
  points: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bfa14a" opacity="0.3"/><path d="M12 8v8M8 12h8" stroke="#ffd700" strokeWidth="2"/></svg>
  ),
};

const sections = [
  { key: 'airdrop', label: '空投活动', icon: icons.airdrop, component: Airdrop },
  { key: 'newbie', label: '新手知识', icon: icons.newbie, component: NewbieGuide },
  { key: 'contract', label: '合约教学', icon: icons.contract, component: ContractTutorial },
  { key: 'points', label: '积分兑换', icon: icons.points, component: PointsExchange },
];

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentKey = location.pathname.replace('/dashboard/', '') || 'airdrop';
  const current = sections.find(s => s.key === currentKey);
  const CurrentComponent = current ? current.component : UserProfile;

  const displayUsername = userInfo.username && userInfo.username.length > 15
    ? userInfo.username.substring(0, 12) + '...'
    : userInfo.username;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dash-bg">
      {/* 顶部导航栏 */}
      <header className="dash-header">
        <div className="dash-header-left">
          <button className="dash-hamburger" onClick={() => setDrawerOpen(true)}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="dash-logo" onClick={() => navigate('/')}><LogoIcon size={28} /> GHOST</div>
        </div>
        <nav className="dash-nav">
          {sections.map(sec => (
            <button
              key={sec.key}
              className={`dash-nav-item${currentKey === sec.key ? ' active' : ''}`}
              onClick={() => navigate(`/dashboard/${sec.key}`)}
            >
              <span className="dash-nav-icon">{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-header-right">
          <button
            className="dash-user-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" fill="#bfa14a" opacity="0.6"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#bfa14a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{displayUsername}</span>
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <path d={userMenuOpen ? "M3 8L6 5L9 8" : "M3 5L6 8L9 5"} stroke="#bfa14a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {userMenuOpen && (
            <div className="dash-user-menu">
              <div className="dash-user-menu-item" onClick={() => { navigate('/dashboard/profile'); setUserMenuOpen(false); }}>
                个人中心
              </div>
              <div className="dash-user-menu-item dash-user-menu-logout" onClick={handleLogout}>
                退出登录
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 移动端抽屉 */}
      {drawerOpen && <div className="dash-overlay" onClick={() => setDrawerOpen(false)} />}
      <aside className={`dash-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="dash-drawer-header">
          <div className="dash-logo"><LogoIcon size={28} /> GHOST</div>
          <button className="dash-drawer-close" onClick={() => setDrawerOpen(false)}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <nav className="dash-drawer-menu">
          {sections.map(sec => (
            <div
              key={sec.key}
              className={`dash-drawer-item${currentKey === sec.key ? ' active' : ''}`}
              onClick={() => { navigate(`/dashboard/${sec.key}`); setDrawerOpen(false); }}
            >
              <span className="dash-nav-icon">{sec.icon}</span>
              <span>{sec.label}</span>
            </div>
          ))}
        </nav>
        <div className="dash-drawer-footer">
          {displayUsername && <><span className="dash-drawer-avatar">👤</span><span className="dash-drawer-username">{displayUsername}</span></>}
          <button className="dash-drawer-profile-btn" onClick={() => { navigate('/dashboard/profile'); setDrawerOpen(false); }}>个人中心</button>
        </div>
      </aside>

      {/* 内容区 */}
      <main className="dash-main">
        <div className="dash-content-header">
          <span className="dash-content-icon">{current ? icons[current.key] : icons.profile}</span>
          <h1 className="dash-content-title">{current ? current.label : '个人中心'}</h1>
        </div>
        <section className="dash-content">
          <CurrentComponent />
        </section>
      </main>
    </div>
  );
}

function App() {
  const { isLoggedIn, userInfo } = useUserStore();

  useEffect(() => {
    if (isLoggedIn && userInfo.is_verified === undefined) {
      if (userInfo.email) {
        const store = useUserStore.getState();
        store.fetchUserByUsername(userInfo.email);
      }
    }
  }, [isLoggedIn, userInfo]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/:docId" element={<DocsPage />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthContainer page="login" />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthContainer page="register" />} />
      <Route path="/forgot" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthContainer page="forgot" />} />
      <Route path="/dashboard" element={isLoggedIn ? <Navigate to="/dashboard/airdrop" /> : <Navigate to="/login" />} />
      <Route path="/dashboard/:section" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
