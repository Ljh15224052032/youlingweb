import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabaseClient';

function UserProfile() {
  const navigate = useNavigate();
  const { userInfo, updateUserInfo, logout, fetchUserByUsername } = useUserStore();
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
      if (!data || data.length === 0) throw new Error('未找到用户记录');

      updateUserInfo(editingInfo);
      Swal.fire({
        icon: 'success',
        title: '保存成功',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '保存失败',
        text: err?.message || '请稍后重试',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
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
        title: '已刷新',
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
        title: '刷新失败',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '确认退出？',
      icon: 'warning',
      background: '#1e222d',
      color: '#d1d4dc',
      showCancelButton: true,
      confirmButtonColor: '#ef5350',
      cancelButtonColor: '#666',
      confirmButtonText: '退出登录',
      cancelButtonText: '取消',
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
      title: '已复制',
      background: '#1e222d',
      color: '#d1d4dc',
      timer: 1000,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    });
  };

  const isPremium = userInfo.level === '高级用户' || userInfo.user_type === 'premium';

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
                <span>积分 {userInfo.points}</span>
                <span>·</span>
                <span style={{ color: userInfo.is_verified ? '#00ff88' : '#ff6b6b' }}>
                  {userInfo.is_verified ? '已认证' : '未认证'}
                </span>
                {isPremium && (
                  <>
                    <span>·</span>
                    <span style={{ color: '#ffcc00' }}>会员 {userInfo.premium_days || 0} 天</span>
                  </>
                )}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>邀请码:</span>
                <code style={{ color: '#ffd700', fontSize: '0.9rem', letterSpacing: '1px' }}>{userInfo.myInviteCode}</code>
                <button onClick={copyInviteCode} style={{
                  background: 'none', border: '1px solid rgba(191,161,74,0.3)', color: '#bfa14a',
                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                }}>复制</button>
              </div>
            </div>
            <button onClick={handleRefreshAll} disabled={refreshing} style={{
              background: 'rgba(191,161,74,0.1)', border: '1px solid rgba(191,161,74,0.2)',
              color: '#bfa14a', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem',
              cursor: refreshing ? 'wait' : 'pointer', opacity: refreshing ? 0.6 : 1
            }}>
              {refreshing ? '刷新中...' : '刷新信息'}
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
          }}>个人信息</button>
          <button onClick={() => setCurrentPage('guide')} style={{
            padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
            border: 'none',
            background: currentPage === 'guide' ? 'rgba(191,161,74,0.2)' : 'transparent',
            color: currentPage === 'guide' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          }}>完善指引</button>
        </div>

        {/* 个人信息表单 */}
        {currentPage === 'profile' && (
          <div style={{
            background: 'rgba(24,24,26,0.9)',
            border: '1px solid rgba(191,161,74,0.15)',
            borderRadius: '14px',
            padding: '1.5rem',
          }}>
            <FormRow label="昵称" value={editingInfo.nickname} onChange={v => setEditingInfo({...editingInfo, nickname: v})} placeholder="请输入昵称" />
            <FormRow label="邮箱" value={userInfo.email} disabled />
            <FormRow label="币安 UID" value={editingInfo.binanceUID || ''} onChange={v => setEditingInfo({...editingInfo, binanceUID: v})} placeholder="请输入币安 UID" hint="绑定币安交易所账户" />
            <FormRow label="Bitget UID" value={editingInfo.bitgetUID || ''} onChange={v => setEditingInfo({...editingInfo, bitgetUID: v})} placeholder="请输入 Bitget UID" hint="绑定 Bitget 交易所账户" />
            <FormRow label="微信号" value={editingInfo.wechat || ''} onChange={v => setEditingInfo({...editingInfo, wechat: v})} placeholder="请输入微信号" hint="用于客服联系和活动通知" />
            <FormRow label="OKX UID" value={editingInfo.okxUID || ''} onChange={v => setEditingInfo({...editingInfo, okxUID: v})} placeholder="请输入 OKX UID" hint="绑定 OKX 交易所账户" />
            <FormRow label="父邀请码" value={userInfo.parentInviteCode || '无'} disabled hint="注册时使用的邀请码" />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={handleSaveProfile} disabled={saving} style={{
                background: 'linear-gradient(135deg, #bfa14a, #ffd700)',
                border: 'none', color: '#18181a', padding: '0.6rem 2rem',
                borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1
              }}>{saving ? '保存中...' : '保存修改'}</button>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid rgba(255,107,107,0.3)',
                color: '#ff6b6b', padding: '0.6rem 1.5rem', borderRadius: '8px',
                fontSize: '0.85rem', cursor: 'pointer'
              }}>退出登录</button>
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
            <h3 style={{ color: '#ffd700', margin: '0 0 1rem' }}>注册完成后信息完善指引</h3>

            <GuideSection title="一、基础信息设置">
              <p><b>昵称</b>：支持中英文及数字组合，2-12 字符，后续可修改。</p>
              <p><b>邮箱</b>：绑定后不可修改，用于登录、密码找回、系统通知。</p>
            </GuideSection>

            <GuideSection title="二、交易所账户关联">
              <p><b>币安 UID</b>：登录币安 → 个人中心获取（纯数字标识）</p>
              <GuideLink href="https://www.maxweb.black/join?ref=738205337" code="738205337" />
              <p><b>Bitget UID</b>：登录 Bitget → 个人中心获取</p>
              <GuideLink href="https://partner.dhxrcw.cn/bg/0998AX" code="qqvc" />
              <p><b>OKX UID</b>：登录 OKX → 个人中心获取</p>
              <GuideLink href="https://www.xacneo.com/join/63940277" code="63940277" />
            </GuideSection>

            <GuideSection title="三、邀请码说明">
              <p><b>父邀请码</b>：注册时使用的邀请码，用于追溯推荐关系。</p>
              <p><b>我的邀请码</b>：系统自动生成，分享给好友注册可获得邀请奖励。</p>
            </GuideSection>

            <GuideSection title="四、注意事项">
              <p>请确保绑定的交易所 UID 为本人真实信息，虚假信息可能导致功能受限。</p>
              <p>信息提交后 1-3 个工作日内完成审核，结果通过邮箱通知。</p>
              <p>如有问题，添加客服微信 <span style={{ color: '#ffd700' }}>admiraltyz</span></p>
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

function GuideLink({ href, code }) {
  return (
    <div style={{ margin: '0.3rem 0 0.5rem', paddingLeft: '1rem' }}>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700', fontSize: '0.85rem' }}>
        {href}
      </a>
      <span style={{ marginLeft: '0.8rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
        邀请码: <span style={{ color: '#bfa14a' }}>{code}</span>
      </span>
    </div>
  );
}

export default UserProfile;
