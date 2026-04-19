import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import useUserStore from '../store/userStore';
import { safeMarkdown, escapeHtml } from '../utils/sanitize';
import { useLang } from '../i18n/context';

function Airdrop() {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { userInfo } = useUserStore();
  const isVerified = userInfo.is_verified;
  const { t } = useLang();

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const { data, error } = await supabase
          .from('airdrops')
          .select('*');
        if (error) throw error;
        const now = new Date();
        const normalized = data.map(a => {
          let autoStatus = a.status;
          if (a.end_time && new Date(a.end_time) <= now) {
            autoStatus = 'ended';
          } else if (a.start_time && new Date(a.start_time) > now) {
            autoStatus = 'upcoming';
          } else if (a.start_time && new Date(a.start_time) <= now) {
            autoStatus = 'ongoing';
          }
          return { ...a, status: autoStatus };
        });
        setAirdrops(normalized);
      } catch {
        setAirdrops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAirdrops();
  }, []);

  const statusOrder = { upcoming: 0, ongoing: 1, ended: 2 };

  const filteredAirdrops = airdrops
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const handleParticipate = (airdrop) => {
    Swal.fire({
      title: airdrop.name,
      width: '70%',
      html: `
        <div class="airdrop-popup-content">
          ${airdrop.content
            ? `<div id="markdown-content-container"></div>`
            : `<div style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">${t('airdrop.noDetail')}</div>`
          }
          <div class="airdrop-popup-info">
            <p><b>${t('airdrop.reward')}</b>${escapeHtml(airdrop.reward || t('airdrop.noReward'))}</p>
            <p><b>${t('airdrop.startTime')}</b>${escapeHtml(airdrop.start_time || t('airdrop.tbd'))}</p>
            <p><b>${t('airdrop.endTime')}</b>${escapeHtml(airdrop.end_time || t('airdrop.tbd'))}</p>
            <p><b>${t('airdrop.status')}</b>${escapeHtml(getStatusText(airdrop.status))}</p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: airdrop.status === 'ongoing',
      cancelButtonText: t('airdrop.close'),
      confirmButtonText: airdrop.status === 'ongoing' ? t('airdrop.joinNow') : t('airdrop.close'),
      confirmButtonColor: '#bfa14a',
      background: '#1a1a1a',
      color: '#eee',
      didOpen: () => {
        if (airdrop.content) {
          const container = document.getElementById('markdown-content-container');
          try {
            container.innerHTML = safeMarkdown(airdrop.content);
            container.querySelectorAll('img').forEach(img => {
              img.style.maxWidth = '30%';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '15px auto';
              img.style.borderRadius = '6px';
            });
          } catch {
            container.textContent = airdrop.content;
          }
        }
      },
    }).then((result) => {
      if (result.isConfirmed && airdrop.status === 'ongoing') {
        handleJoinActivity(airdrop);
      }
    });
  };

  const handleJoinActivity = async (airdrop) => {
    if (!userInfo.id) {
      Swal.fire({ title: t('airdrop.needLogin'), text: t('airdrop.needLoginMsg'), icon: 'warning', background: '#1e222d', color: '#d1d4dc' });
      return;
    }
    if (!isVerified) {
      Swal.fire({ title: t('airdrop.needVerify'), text: t('airdrop.needVerifyMsg'), icon: 'warning', background: '#1e222d', color: '#d1d4dc' });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: t('airdrop.joinActivity'),
      html: `
        <div style="text-align:left">
          <label style="color:#bfa14a;font-size:0.85rem">${t('airdrop.descLabel')}</label>
          <textarea id="submission-text" class="swal2-textarea" placeholder="${t('airdrop.descPlaceholder')}" style="margin-bottom:0.8rem"></textarea>
          <label style="color:#bfa14a;font-size:0.85rem">${t('airdrop.screenshotLabel')}</label>
          <input id="submission-file" type="file" accept="image/*" class="swal2-file">
        </div>
      `,
      showCancelButton: true,
      cancelButtonText: t('airdrop.cancel'),
      confirmButtonText: t('airdrop.submit'),
      background: '#1e222d',
      color: '#d1d4dc',
      confirmButtonColor: '#bfa14a',
      cancelButtonColor: '#666',
      preConfirm: () => {
        const text = document.getElementById('submission-text').value;
        const file = document.getElementById('submission-file').files[0];
        if (!text) { Swal.showValidationMessage(t('airdrop.enterDesc')); return false; }
        if (!file) { Swal.showValidationMessage(t('airdrop.uploadScreenshot')); return false; }
        return { text, file };
      }
    });

    if (!formValues) return;

    try {
      const fileExt = formValues.file.name.split('.').pop();
      const filePath = `activity_submissions/${userInfo.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('activity_images')
        .upload(filePath, formValues.file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(filePath);

      const { error: submitError } = await supabase
        .from('activity_submissions')
        .insert([{
          user_id: userInfo.id,
          airdrop_id: airdrop.id,
          submission_text: formValues.text,
          submission_image: publicUrl,
          status: 'pending',
        }]);
      if (submitError) throw submitError;

      await supabase.rpc('increment_participants', { airdrop_id: airdrop.id });

      Swal.fire({ icon: 'success', title: t('airdrop.submitSuccess'), text: t('airdrop.submitSuccessMsg'), background: '#1e222d', color: '#d1d4dc' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: t('airdrop.submitFailed'), text: error?.message || t('airdrop.submitFailed'), background: '#1e222d', color: '#d1d4dc' });
    }
  };

  const getStatusText = (status) => {
    const map = { upcoming: t('airdrop.statusUpcoming'), ongoing: t('airdrop.statusOngoing'), ended: t('airdrop.statusEnded') };
    return map[status] || '';
  };

  const getStatusColor = (status) => {
    return { upcoming: '#ffd700', ongoing: '#00ff88', ended: '#ff6b6b' }[status] || '#999';
  };

  const filterTabs = [
    { key: 'all', label: t('airdrop.filterAll') },
    { key: 'ongoing', label: t('airdrop.filterOngoing') },
    { key: 'upcoming', label: t('airdrop.filterUpcoming') },
    { key: 'ended', label: t('airdrop.filterEnded') },
  ];

  if (!isVerified) {
    return (
      <div className="component-container">
        <div className="verification-required">
          <h2>{t('airdrop.needVerifyTitle')}</h2>
          <p>{t('airdrop.needVerifyDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <SimpleBar style={{ height: 'calc(100vh - 120px)' }}>
        <div style={{ padding: '1rem 0' }}>
          {/* 筛选栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: statusFilter === tab.key ? 'rgba(191,161,74,0.25)' : 'rgba(255,255,255,0.05)',
                  color: statusFilter === tab.key ? '#ffd700' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
            <input
              type="text"
              className="airdrop-search"
              placeholder={t('airdrop.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                marginLeft: 'auto',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid rgba(191,161,74,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '180px',
              }}
            />
          </div>

          {/* 活动列表 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>{t('airdrop.loading')}</div>
          ) : filteredAirdrops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>{t('airdrop.noData')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
              {filteredAirdrops.map(airdrop => (
                <div
                  key={airdrop.id}
                  style={{
                    background: 'rgba(24,24,26,0.9)',
                    border: '1px solid rgba(191,161,74,0.15)',
                    borderRadius: '12px',
                    padding: '1.2rem',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleParticipate(airdrop)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ margin: 0, color: '#ffd700', fontSize: '1rem' }}>{airdrop.name}</h3>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#18181a',
                      background: getStatusColor(airdrop.status),
                    }}>
                      {getStatusText(airdrop.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                    {airdrop.reward && <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('airdrop.rewardLabel')}</span>{airdrop.reward}</div>}
                    {airdrop.end_time && <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('airdrop.deadlineLabel')}</span>{airdrop.end_time}</div>}
                  </div>
                  <button style={{
                    marginTop: '0.8rem',
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: airdrop.status === 'ongoing' ? 'rgba(191,161,74,0.15)' : 'rgba(255,255,255,0.05)',
                    color: airdrop.status === 'ongoing' ? '#ffd700' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}>
                    {airdrop.status === 'ongoing' ? t('airdrop.viewDetailJoin') : t('airdrop.viewDetail')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SimpleBar>
      <style>{`
        @media (max-width: 768px) {
          .airdrop-search {
            margin-left: 0 !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Airdrop;
