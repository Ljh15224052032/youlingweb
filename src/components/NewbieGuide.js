import React, { useState, useEffect } from 'react';
import './Components.css';
import { supabase } from '../services/supabaseClient';
import useUserStore from '../store/userStore';
import { safeMarkdown, escapeHtml } from '../utils/sanitize';

function NewbieGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { userInfo } = useUserStore();
  const isVerified = userInfo.is_verified;

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('newbie_guides')
          .select('id, title, content, category, cover_image, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGuides(data || []);
        if (data && data.length > 0) setSelectedGuide(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const categories = ['all', ...new Set(guides.map(g => g.category).filter(Boolean))];
  const filteredGuides = categoryFilter === 'all'
    ? guides
    : guides.filter(g => g.category === categoryFilter);

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    setMobileMenuOpen(false);
  };

  if (!isVerified) {
    return (
      <div className="component-container">
        <div className="verification-required">
          <h2>需要账号验证</h2>
          <p>请先完成账号验证（绑定 UID）后再访问此页面</p>
        </div>
      </div>
    );
  }

  // 侧边栏内容（桌面端和移动端共用）
  const sidebarContent = (
    <>
      {/* 分类筛选 */}
      <div style={{ padding: '1rem' }}>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '0.45rem 0.6rem',
            borderRadius: '8px',
            border: '1px solid rgba(191,161,74,0.3)',
            background: 'rgba(255,255,255,0.05)',
            color: '#ffd700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} style={{ background: '#1a1a1a', color: '#eee' }}>
              {cat === 'all' ? '全部分类' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* 指南列表 */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}
        className="docs-content-scroll">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>加载中...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b', fontSize: '0.85rem' }}>
            <p>加载失败</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
            >重试</button>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>暂无指南</div>
        ) : (
          filteredGuides.map(guide => (
            <div
              key={guide.id}
              onClick={() => handleGuideSelect(guide)}
              style={{
                padding: '0.7rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: selectedGuide?.id === guide.id ? '#ffd700' : 'rgba(255,255,255,0.6)',
                background: selectedGuide?.id === guide.id ? 'rgba(191,161,74,0.1)' : 'transparent',
                borderRight: selectedGuide?.id === guide.id ? '3px solid #ffd700' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (selectedGuide?.id !== guide.id) {
                  e.currentTarget.style.background = 'rgba(191,161,74,0.05)';
                  e.currentTarget.style.color = '#bfa14a';
                }
              }}
              onMouseLeave={e => {
                if (selectedGuide?.id !== guide.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              {guide.title}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
          }}
        />
      )}

      {/* 左侧目录 */}
      <aside
        className="nb-sidebar"
        style={{
          width: '280px',
          minHeight: 0,
          borderRight: '1px solid rgba(191,161,74,0.1)',
          background: 'rgba(20,20,24,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: mobileMenuOpen ? 'fixed' : undefined,
          left: mobileMenuOpen ? 0 : undefined,
          top: mobileMenuOpen ? 0 : undefined,
          zIndex: mobileMenuOpen ? 100 : undefined,
          height: mobileMenuOpen ? '100%' : undefined,
        }}
      >
        {/* 移动端关闭按钮 */}
        {mobileMenuOpen && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 0.5rem 0' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        {sidebarContent}
      </aside>

      {/* 右侧内容 */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'scroll', scrollbarWidth: 'none' }}
        className="docs-content-scroll">
        {/* 移动端汉堡按钮 + 当前标题 */}
        <div className="nb-mobile-header">
          <button
            className="nb-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <span style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: 600 }}>
            {selectedGuide ? selectedGuide.title : '新手知识'}
          </span>
        </div>

        {!selectedGuide ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
            <p>选择左侧指南开始阅读</p>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{
              fontSize: '1.8rem',
              color: '#ffd700',
              margin: '0 0 0.5rem',
              paddingBottom: '0.8rem',
              borderBottom: '1px solid rgba(191,161,74,0.2)',
            }}>
              {escapeHtml(selectedGuide.title)}
            </h1>

            {selectedGuide.category && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#18181a',
                  background: '#bfa14a',
                }}>
                  {escapeHtml(selectedGuide.category)}
                </span>
              </div>
            )}

            {selectedGuide.cover_image && (
              <img
                src={selectedGuide.cover_image}
                alt={selectedGuide.title}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                }}
              />
            )}

            <div
              className="docs-content"
              dangerouslySetInnerHTML={{ __html: safeMarkdown(selectedGuide.content || '') }}
            />
          </div>
        )}
      </main>

      <style>{`
        .docs-content-scroll::-webkit-scrollbar {
          display: none;
        }
        .nb-mobile-header {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid rgba(191,161,74,0.1);
        }
        .nb-mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        @media (max-width: 768px) {
          .nb-sidebar {
            display: none !important;
          }
          .nb-sidebar[style*="fixed"] {
            display: flex !important;
          }
          .nb-mobile-header {
            display: flex !important;
          }
          .nb-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default NewbieGuide;
