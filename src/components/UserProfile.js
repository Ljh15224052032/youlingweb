import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabaseClient';
import { useLang } from '../i18n/context';

function UserProfile() {
  const navigate = useNavigate();
  const { userInfo, updateUserInfo, logout, fetchUserByUsername } = useUserStore();
  const { t } = useLang();
  const [editingInfo, setEditingInfo] = useState({
    ...userInfo,
    nickname: userInfo.nickname || '',
    binanceUID: userInfo.binanceUID || '',
    bitgetUID: userInfo.bitgetUID || '',
    wechat: userInfo.wechat || '',
    okxUID: userInfo.okxUID || ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState('profile');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditingInfo({
      ...userInfo,
      nickname: userInfo.nickname || '',
      binanceUID: userInfo.binanceUID || '',
      bitgetUID: userInfo.bitgetUID || '',
      wechat: userInfo.wechat || '',
      okxUID: userInfo.okxUID || ''
    });
  }, [userInfo]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('users')
        .update({
          nickname: editingInfo.nickname,
          binance_uid: editingInfo.binanceUID || null,
          bg_uid: editingInfo.bitgetUID || null,
          wechat: editingInfo.wechat || null,
          okx_uid: editingInfo.okxUID || null,
        })
        .eq('username', userInfo.email)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error(t('profile.userNotFound'));

      updateUserInfo(editingInfo);
      Swal.fire({
        icon: 'success',
        title: t('profile.saveSuccess'),
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: t('profile.confirm'),
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('profile.saveFailed'),
        text: err?.message || t('profile.retryLater'),
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: t('profile.confirm')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setRefreshing(true);
      if (userInfo.email) {
        await fetchUserByUsername(userInfo.email);
      }
      Swal.fire({
        icon: 'success',
        title: t('profile.refreshed'),
        background: '#1e222d',
        color: '#d1d4dc',
        timer: 1200,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: t('profile.refreshFailed'),
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: t('profile.confirm')
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: t('profile.confirmLogout'),
      icon: 'warning',
      background: '#1e222d',
      color: '#d1d4dc',
      showCancelButton: true,
      confirmButtonColor: '#ef5350',
      cancelButtonColor: '#666',
      confirmButtonText: t('profile.logout'),
      cancelButtonText: t('profile.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(userInfo.myInviteCode);
    Swal.fire({
      icon: 'success',
      title: t('profile.copied'),
      background: '#1e222d',
      color: '#d1d4dc',
      timer: 1000,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    });
  };

  const isPremium = userInfo.level === t('profile.advancedUser') || userInfo.user_type === 'premium';

  return (
    <SimpleBar style={{ height: '100%' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>

        {/* 信息卡片 */}
        <div style={{
          background: 'rgba(24,24,26,0.9)',
          border: '1px solid rgba(191,161,74,0.15)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2.5rem' }}>{userInfo.avatar || '👤'}</div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 0.3rem', color: '#ffd700', fontSize: '1.2rem' }}>{userInfo.username}</h3>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#bfa14a' }}>{userInfo.level}</span>
                <span>·</span>
                <span>{t('profile.points')} {userInfo.points}</span>
                <span>·</span>
                <span style={{ color: userInfo.is_verified ? '#00ff88' : '#ff6b6b' }}>
                  {userInfo.is_verified ? t('profile.verified') : t('profile.unverified')}
                </span>
                {isPremium && (
                  <>
                    <span>·</span>
                    <span style={{ color: '#ffcc00' }}>{t('profile.memberDays').replace('{days}', userInfo.premium_days || 0)}</span>
                  </>
                )}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{t('profile.inviteCode')}</span>
                <code style={{ color: '#ffd700', fontSize: '0.9rem', letterSpacing: '1px' }}>{userInfo.myInviteCode}</code>
                <button onClick={copyInviteCode} style={{
                  background: 'none', border: '1px solid rgba(191,161,74,0.3)', color: '#bfa14a',
                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                }}>{t('profile.copy')}</button>
              </div>
            </div>
            <button onClick={handleRefreshAll} disabled={refreshing} style={{
              background: 'rgba(191,161,74,0.1)', border: '1px solid rgba(191,161,74,0.2)',
              color: '#bfa14a', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem',
              cursor: refreshing ? 'wait' : 'pointer', opacity: refreshing ? 0.6 : 1
            }}>
              {refreshing ? t('profile.refreshing') : t('profile.refreshInfo')}
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setCurrentPage('profile')} style={{
            padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
            border: 'none',
            background: currentPage === 'profile' ? 'rgba(191,161,74,0.2)' : 'transparent',
            color: currentPage === 'profile' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          }}>{t('profile.personalInfo')}</button>
          <button onClick={() => setCurrentPage('guide')} style={{
            padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
            border: 'none',
            background: currentPage === 'guide' ? 'rgba(191,161,74,0.2)' : 'transparent',
            color: currentPage === 'guide' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          }}>{t('profile.guideTab')}</button>
        </div>

        {/* 个人信息表单 */}
        {currentPage === 'profile' && (
          <div style={{
            background: 'rgba(24,24,26,0.9)',
            border: '1px solid rgba(191,161,74,0.15)',
            borderRadius: '14px',
            padding: '1.5rem',
          }}>
            <FormRow label={t('profile.nickname')} value={editingInfo.nickname} onChange={v => setEditingInfo({...editingInfo, nickname: v})} placeholder={t('profile.nicknamePlaceholder')} />
            <FormRow label={t('profile.email')} value={userInfo.email} disabled />
            <FormRow label={t('profile.binanceUID')} value={editingInfo.binanceUID || ''} onChange={v => setEditingInfo({...editingInfo, binanceUID: v})} placeholder={t('profile.binanceUIDPlaceholder')} hint={t('profile.binanceUIDHint')} />
            <FormRow label={t('profile.bitgetUID')} value={editingInfo.bitgetUID || ''} onChange={v => setEditingInfo({...editingInfo, bitgetUID: v})} placeholder={t('profile.bitgetUIDPlaceholder')} hint={t('profile.bitgetUIDHint')} />
            <FormRow label={t('profile.wechat')} value={editingInfo.wechat || ''} onChange={v => setEditingInfo({...editingInfo, wechat: v})} placeholder={t('profile.wechatPlaceholder')} hint={t('profile.wechatHint')} />
            <FormRow label={t('profile.okxUID')} value={editingInfo.okxUID || ''} onChange={v => setEditingInfo({...editingInfo, okxUID: v})} placeholder={t('profile.okxUIDPlaceholder')} hint={t('profile.okxUIDHint')} />
            <FormRow label={t('profile.parentInviteCode')} value={userInfo.parentInviteCode || t('profile.none')} disabled hint={t('profile.parentCodeHint')} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={handleSaveProfile} disabled={saving} style={{
                background: 'linear-gradient(135deg, #bfa14a, #ffd700)',
                border: 'none', color: '#18181a', padding: '0.6rem 2rem',
                borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1
              }}>{saving ? t('profile.saving') : t('profile.save')}</button>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid rgba(255,107,107,0.3)',
                color: '#ff6b6b', padding: '0.6rem 1.5rem', borderRadius: '8px',
                fontSize: '0.85rem', cursor: 'pointer'
              }}>{t('profile.logoutBtn')}</button>
            </div>
          </div>
        )}

        {/* 完善指引 */}
        {currentPage === 'guide' && (
          <div style={{
            background: 'rgba(24,24,26,0.9)',
            border: '1px solid rgba(191,161,74,0.15)',
            borderRadius: '14px',
            padding: '1.5rem',
            lineHeight: '1.8',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
          }}>
            <h3 style={{ color: '#ffd700', margin: '0 0 1rem' }}>{t('profile.guideTitle')}</h3>

            <GuideSection title={t('profile.guide1Title')}>
              <p>{t('profile.guide1Nickname')}</p>
              <p>{t('profile.guide1Email')}</p>
            </GuideSection>

            <GuideSection title={t('profile.guide2Title')}>
              <p>{t('profile.guide2Binance')}</p>
              <GuideLink href="https://www.maxweb.black/join?ref=738205337" code="738205337" t={t} />
              <p>{t('profile.guide2Bitget')}</p>
              <GuideLink href="https://partner.dhxrcw.cn/bg/0998AX" code="qqvc" t={t} />
              <p>{t('profile.guide2Okx')}</p>
              <GuideLink href="https://www.xacneo.com/join/63940277" code="63940277" t={t} />
            </GuideSection>

            <GuideSection title={t('profile.guide3Title')}>
              <p>{t('profile.guide3Parent')}</p>
              <p>{t('profile.guide3Mine')}</p>
            </GuideSection>

            <GuideSection title={t('profile.guide4Title')}>
              <p>{t('profile.guide4Note1')}</p>
              <p>{t('profile.guide4Note2')}</p>
              <p>{t('profile.guide4Note3')}</p>
            </GuideSection>
          </div>
        )}
      </div>
    </SimpleBar>
  );
}

function FormRow({ label, value, onChange, placeholder, disabled, hint }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px',
          border: disabled ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(191,161,74,0.2)',
          background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
          color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
          fontSize: '0.9rem', outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {hint && <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{hint}</small>}
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <h4 style={{ color: '#bfa14a', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{title}</h4>
      {children}
    </div>
  );
}

function GuideLink({ href, code, t }) {
  return (
    <div style={{ margin: '0.3rem 0 0.5rem', paddingLeft: '1rem' }}>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700', fontSize: '0.85rem' }}>
        {href}
      </a>
      <span style={{ marginLeft: '0.8rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
        {t('profile.inviteCodeLabel')} <span style={{ color: '#bfa14a' }}>{code}</span>
      </span>
    </div>
  );
}

export default UserProfile;
