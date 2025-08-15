import React, { useState } from 'react';
import AuthContainer from './AuthContainer';
import Airdrop from './components/Airdrop';
import NewbieGuide from './components/NewbieGuide';
import ContractTutorial from './components/ContractTutorial';
import TradingTools from './components/TradingTools';
import UserProfile from './components/UserProfile';
import ContentManagement from './components/ContentManagement';
import PointsExchange from './components/PointsExchange';
import useUserStore from './store/userStore';
import './App.css';

// 纯白SVG图标组件
const icons = {
  airdrop: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.9"/><path d="M12 7v5l4 2" stroke="#18181a" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  newbie: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#fff" opacity="0.9"/><path d="M8 8h8v2H8zm0 4h8v2H8z" fill="#18181a"/></svg>
  ),
  contract: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" fill="#fff" opacity="0.9"/><path d="M9 7h6M9 11h6M9 15h3" stroke="#18181a" strokeWidth="2"/></svg>
  ),
  tools: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.9"/><path d="M15 9l-6 6M9 9l6 6" stroke="#18181a" strokeWidth="2"/></svg>
  ),
  profile: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="#fff" opacity="0.9"/><rect x="6" y="15" width="12" height="5" rx="2.5" fill="#fff" opacity="0.9"/></svg>
  ),
 
  points: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.9"/><path d="M12 8v8M8 12h8" stroke="#18181a" strokeWidth="2"/></svg>
  ),
  user: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="#fff" opacity="0.9"/><rect x="6" y="15" width="12" height="5" rx="2.5" fill="#fff" opacity="0.9"/></svg>
  )
};

const sections = [
  { key: 'airdrop', label: '空投活动', icon: icons.airdrop, component: Airdrop },
  { key: 'newbie', label: '新手知识', icon: icons.newbie, component: NewbieGuide },
  { key: 'contract', label: '合约教学', icon: icons.contract, component: ContractTutorial },
  { key: 'tools', label: '看盘工具', icon: icons.tools, component: TradingTools },
  { key: 'profile', label: '个人中心', icon: icons.profile, component: UserProfile },
  { key: 'points', label: '积分兑换', icon: icons.points, component: PointsExchange },
];

function App() {
  const [currentSection, setCurrentSection] = useState(sections[0].key);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isLoggedIn, userInfo, logout } = useUserStore();

  if (!isLoggedIn) {
    return <AuthContainer />;
  }

  const current = sections.find(s => s.key === currentSection);
  const CurrentComponent = current.component;

  // 处理用户名长度，超过15个字符时显示前12个字符加省略号
  const displayUsername = userInfo.username && userInfo.username.length > 15 
    ? userInfo.username.substring(0, 12) + '...' 
    : userInfo.username;

  return (
    <div className="layout-bg">
      <aside className="sidebar">
        <div className="sidebar-logo">游领资本</div>
        <nav className="sidebar-menu">
          {sections.map(sec => (
            <div
              key={sec.key}
              className={`sidebar-item${currentSection === sec.key ? ' active' : ''}`}
              onClick={() => setCurrentSection(sec.key)}
            >
              <span className="sidebar-icon">{sec.icon}</span>
              <span className="sidebar-label">{sec.label}</span>
            </div>
          ))}
        </nav>
        <div
          className="mainbar-user sidebar-user"
          onClick={() => setCurrentSection('profile')}
        >
          <span className="user-avatar">{icons.user}</span>
          <span className="user-name">{displayUsername}</span>
        </div>
      </aside>
      <main className="main-area">
        <header className="mainbar-header">
          <div className="mainbar-section">
            <span className="mainbar-icon">{icons[current.key]}</span>
            <span className="mainbar-title">{current.label}</span>
          </div>
        </header>
        <section className="mainbar-content">
          <CurrentComponent />
        </section>
      </main>
    </div>
  );
}

export default App;
