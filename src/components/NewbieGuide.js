import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import useUserStore from '../store/userStore';
import { marked } from 'marked';
import Swal from 'sweetalert2';
import { safeMarkdown, escapeHtml } from '../utils/sanitize';

function NewbieGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);

  const { userInfo } = useUserStore();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!userInfo.id) {
        setVerificationLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_verified')
          .eq('id', userInfo.id)
          .single();
        if (error) throw error;
        setIsVerified(data.is_verified);
      } catch {
        setIsVerified(false);
      } finally {
        setVerificationLoading(false);
      }
    };
    checkUserStatus();
  }, [userInfo.id]);

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

  const handleGuideClick = (guide) => {
    Swal.fire({
      title: guide.title,
      width: '70%',
      html: `
        <div class="guide-popup-content">
          ${guide.cover_image ? `<img src="${escapeHtml(guide.cover_image)}" style="max-width:100%;max-height:200px;border-radius:8px;margin-bottom:1rem;display:block;margin-left:auto;margin-right:auto" />` : ''}
          ${guide.content ? '<div id="guide-markdown-content"></div>' : '<div style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">暂无内容</div>'}
          <div style="margin-top:1rem;padding-top:0.8rem;border-top:1px solid rgba(255,255,255,0.1);font-size:0.85rem;color:rgba(255,255,255,0.4)">
            <span>分类：${escapeHtml(guide.category || '未分类')}</span>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#eee',
      didOpen: () => {
        if (guide.content) {
          const container = document.getElementById('guide-markdown-content');
          try {
            marked.setOptions({ breaks: true, gfm: true });
            container.innerHTML = safeMarkdown(guide.content);
            container.querySelectorAll('img').forEach(img => {
              img.style.maxWidth = '30%';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '15px auto';
              img.style.borderRadius = '6px';
            });
          } catch {
            container.textContent = guide.content;
          }
        }
      },
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      '基础': '#ffd700',
      '投资': '#00ff88',
      'DeFi': '#4fc3f7',
      'NFT': '#e040fb',
      '交易': '#ff7043',
    };
    return colors[category] || '#bfa14a';
  };

  if (verificationLoading) {
    return (
      <div className="component-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>验证用户状态中...</div>
      </div>
    );
  }

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

  return (
    <div className="component-container">
      <SimpleBar style={{ height: 'calc(100vh - 120px)' }}>
        <div style={{ padding: '1rem 0' }}>
          {/* 分类筛选 */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: categoryFilter === cat ? 'rgba(191,161,74,0.25)' : 'rgba(255,255,255,0.05)',
                  color: categoryFilter === cat ? '#ffd700' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>

          {/* 指南列表 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>加载中...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#ff6b6b' }}>
              <p>加载失败：{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: '#fff', cursor: 'pointer' }}
              >重试</button>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>暂无指南</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filteredGuides.map(guide => (
                <div
                  key={guide.id}
                  style={{
                    background: 'rgba(24,24,26,0.9)',
                    border: '1px solid rgba(191,161,74,0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleGuideClick(guide)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#bfa14a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(191,161,74,0.15)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {guide.cover_image && (
                    <div style={{ width: '100%', height: '150px', overflow: 'hidden' }}>
                      <img
                        src={guide.cover_image}
                        alt={guide.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: '#ffd700', fontSize: '1rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.title}</h3>
                      {guide.category && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#18181a',
                          background: getCategoryColor(guide.category),
                          whiteSpace: 'nowrap',
                        }}>
                          {guide.category}
                        </span>
                      )}
                    </div>
                    {guide.content && (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {guide.content.replace(/[#*[\]`>]/g, '').substring(0, 60)}...
                      </div>
                    )}
                    <button style={{
                      marginTop: '0.8rem',
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(191,161,74,0.15)',
                      color: '#ffd700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}>
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SimpleBar>
    </div>
  );
}

export default NewbieGuide;
