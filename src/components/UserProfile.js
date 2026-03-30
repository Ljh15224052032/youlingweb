import React, { useState, useRef, useEffect } from 'react';
import useUserStore from '../store/userStore';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabaseClient';


// 添加旋转动画样式
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function UserProfile() {
  const { userInfo, updateUserInfo, logout, fetchUserByUsername } = useUserStore();
  const [editingInfo, setEditingInfo] = useState({ 
    ...userInfo,
    nickname: userInfo.nickname || '',
    binanceUID: userInfo.binanceUID || '',
    bitgetUID: userInfo.bitgetUID || '',
    wechat: userInfo.wechat || '',
    okxUID: userInfo.okxUID || ''
  });
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [refreshingVerification, setRefreshingVerification] = useState(false);
  const [refreshingPremiumDays, setRefreshingPremiumDays] = useState(false);
  const [refreshingUserLevel, setRefreshingUserLevel] = useState(false);
  const [refreshingAllInfo, setRefreshingAllInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState('profile'); // 'profile' 或 'guide'



  // 同步userInfo的变化到editingInfo 测试1111
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

  // 添加旋转动画样式到文档
  useEffect(() => {
    // 添加旋转动画样式
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(spinnerStyle));
    document.head.appendChild(styleElement);
    
    // 组件卸载时清除样式
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSaveProfile = async () => {
    try {
      console.log('准备更新数据:', {
        nickname: editingInfo.nickname,
        binance_uid: editingInfo.binanceUID || null,
        bg_uid: editingInfo.bitgetUID || null,
        wechat: editingInfo.wechat || null,
        okx_uid: editingInfo.okxUID || null,
        查询条件_email: userInfo.email,
        userInfo完整内容: userInfo
      });

      // 更新 Supabase 数据库
      const { data, error } = await supabase
        .from('users')
        .update({
          nickname: editingInfo.nickname,
          binance_uid: editingInfo.binanceUID || null,
          bg_uid: editingInfo.bitgetUID || null,
          wechat: editingInfo.wechat || null,
          okx_uid: editingInfo.okxUID || null,
        })
        .eq('username', userInfo.email) // 使用邮箱作为查询条件（email 存储在 username 字段中）
        .select(); // 返回更新后的数据

      console.log('Supabase 更新结果:', { data, error });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('没有找到匹配的用户记录进行更新');
      }

      // 更新本地 store
      updateUserInfo(editingInfo);
      
      Swal.fire({
        icon: 'success',
        title: '保存成功！',
        text: '个人信息已成功保存',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('保存失败:', err);
      Swal.fire({
        icon: 'error',
        title: '保存失败！',
        text: `保存失败：${err?.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    }
  };

  // 刷新积分的函数
  const refreshPoints = async () => {
    try {
      if (!userInfo.email) {
        throw new Error('用户未登录或邮箱不存在');
      }
      
      setRefreshingPoints(true);
      
      // 直接从Supabase获取最新的积分信息
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('username', userInfo.email)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('未找到用户数据');
      
      // 更新本地存储中的积分
      updateUserInfo({ points: data.points });
      
      Swal.fire({
        icon: 'success',
        title: '刷新成功',
        text: '积分已更新',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('刷新积分失败:', err);
      Swal.fire({
        icon: 'error',
        title: '刷新失败',
        text: `刷新积分失败: ${err.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshingPoints(false);
    }
  };
  
  // 刷新所有用户信息
  const refreshAllUserInfo = async () => {
    try {
      if (!userInfo.email) {
        throw new Error('用户未登录或邮箱不存在');
      }
      
      setRefreshingAllInfo(true);
      
      // 从Supabase重新获取用户完整信息
      await fetchUserByUsername(userInfo.email);
      
      Swal.fire({
        icon: 'success',
        title: '刷新成功',
        text: '所有用户信息已更新',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('刷新用户信息失败:', err);
      Swal.fire({
        icon: 'error',
        title: '刷新失败',
        text: `刷新用户信息失败: ${err?.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshingAllInfo(false);
    }
  };

  // 刷新用户级别信息（普通/高级用户）
  const refreshUserLevel = async () => {
    try {
      if (!userInfo.email) {
        throw new Error('用户未登录或邮箱不存在');
      }
      
      setRefreshingUserLevel(true);
      
      // 从Supabase获取最新的用户级别信息
      const { data, error } = await supabase
        .from('users')
        .select('user_type, premium_days')
        .eq('username', userInfo.email)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('未找到用户数据');
      
      // 更新本地存储中的用户级别信息
      const level = data.user_type === 'premium' ? '高级用户' : '普通用户';
      updateUserInfo({
        level: level,
        user_type: data.user_type || '普通用户',
        premium_days: typeof data.premium_days === 'number' ? data.premium_days : 0
      });
      
      Swal.fire({
        icon: 'success',
        title: '刷新成功',
        text: '用户级别信息已更新',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('刷新用户级别信息失败:', err);
      Swal.fire({
        icon: 'error',
        title: '刷新失败',
        text: `刷新用户级别信息失败: ${err.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshingUserLevel(false);
    }
  };
  
  // 刷新高级会员剩余天数
  const refreshPremiumDays = async () => {
    try {
      if (!userInfo.email) {
        throw new Error('用户未登录或邮箱不存在');
      }
      
      setRefreshingPremiumDays(true);
      
      // 从Supabase获取最新的高级会员剩余天数
      const { data, error } = await supabase
        .from('users')
        .select('premium_days')
        .eq('username', userInfo.email)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('未找到用户数据');
      
      // 更新本地存储中的高级会员剩余天数
      updateUserInfo({ premium_days: data.premium_days });
      
      Swal.fire({
        icon: 'success',
        title: '刷新成功',
        text: '会员剩余天数已更新',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('刷新高级会员剩余天数失败:', err);
      Swal.fire({
        icon: 'error',
        title: '刷新失败',
        text: `刷新高级会员剩余天数失败: ${err.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshingPremiumDays(false);
    }
  };

  // 刷新认证状态的函数
  const refreshVerification = async () => {
    try {
      if (!userInfo.email) {
        throw new Error('用户未登录或邮箱不存在');
      }
      
      setRefreshingVerification(true);
      
      // 从Supabase获取最新的认证状态
      const { data, error } = await supabase
        .from('users')
        .select('is_verified')
        .eq('username', userInfo.email)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('未找到用户数据');
      
      // 更新本地存储中的认证状态
      updateUserInfo({ is_verified: data.is_verified });
      
      Swal.fire({
        icon: 'success',
        title: '刷新成功',
        text: '认证状态已更新',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#bfa14a',
        confirmButtonText: '确定',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('刷新认证状态失败:', err);
      Swal.fire({
        icon: 'error',
        title: '刷新失败',
        text: `刷新认证状态失败: ${err.message || '请稍后重试'}`,
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
    } finally {
      setRefreshingVerification(false);
    }
  };



  return (
    <div className="component-container">
      <div className="profile-layout">
        <div className="profile-sidebar">
                      <div className="user-summary">
            <div className="user-avatar">{userInfo.avatar}</div>
            <h3>{userInfo.username}</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="user-level">{userInfo.level}</p>
              <button 
                onClick={refreshUserLevel}
                disabled={refreshingUserLevel}
                style={{
                  marginLeft: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#bfa14a',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}
              >
                {refreshingUserLevel ? (
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfa14a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                ) : (
                  <span style={{ fontSize: '16px' }}>↻</span>
                )}
              </button>
            </div>
            <div className="points-display">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>积分：{userInfo.points}</span>
                <button 
                  onClick={refreshPoints}
                  disabled={refreshingPoints}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bfa14a',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    padding: '2px 5px',
                    borderRadius: '3px'
                  }}
                >
                  {refreshingPoints ? (
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfa14a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                  ) : (
                    <span style={{ fontSize: '16px' }}>↻</span>
                  )}
                </button>
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>认证状态：{userInfo.is_verified ? '已认证' : '未认证'}</span>
              <button 
                onClick={refreshVerification}
                disabled={refreshingVerification}
                style={{
                  marginLeft: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#bfa14a',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}
              >
                {refreshingVerification ? (
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfa14a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                ) : (
                  <span style={{ fontSize: '16px' }}>↻</span>
                )}
              </button>
            </div>
            
            {(userInfo.level === '高级用户' || userInfo.user_type === 'premium') && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>会员剩余天数：{userInfo.premium_days || 0}</span>
                <button 
                  onClick={refreshPremiumDays}
                  disabled={refreshingPremiumDays}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bfa14a',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    padding: '2px 5px',
                    borderRadius: '3px'
                  }}
                >
                  {refreshingPremiumDays ? (
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfa14a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                  ) : (
                    <span style={{ fontSize: '16px' }}>↻</span>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <nav className="profile-nav">
            <button 
              className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              个人信息
            </button>
            
            <button 
              className={`nav-btn ${currentPage === 'guide' ? 'active' : ''}`}
              onClick={() => setCurrentPage('guide')}
            >
              信息完善指引
            </button>
            
            <button 
              className="nav-btn"
              onClick={refreshAllUserInfo}
              disabled={refreshingAllInfo}
              style={refreshingAllInfo ? {opacity: 0.7} : {}}
            >
              {refreshingAllInfo ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', marginRight: '8px' }}></span>
                  刷新中...
                </>
              ) : '刷新所有信息'}
            </button>
            
            <button 
              className="nav-btn logout-nav-btn"
              onClick={() => {
                Swal.fire({
                  title: '确认退出？',
                  text: '您确定要退出登录吗？',
                  icon: 'warning',
                  background: '#1e222d',
                  color: '#d1d4dc',
                  showCancelButton: true,
                  confirmButtonColor: '#ef5350',
                  cancelButtonColor: '#666',
                  confirmButtonText: '退出登录',
                  cancelButtonText: '取消',
                  reverseButtons: true
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire({
                      icon: 'success',
                      title: '退出成功！',
                      text: '正在为您退出登录...',
                      background: '#1e222d',
                      color: '#d1d4dc',
                      confirmButtonColor: '#bfa14a',
                      timer: 1000,
                      timerProgressBar: true,
                      showConfirmButton: false
                    }).then(() => {
                      logout();
                      window.location.reload();
                    });
                  }
                });
              }}
            >
              退出登录
            </button>
          </nav>
        </div>
        
        <SimpleBar className="profile-main">
          {/* 个人信息页面 */}
          {currentPage === 'profile' && (
            <div className="profile-section">
              <h2 className="section-title">个人信息</h2>
              <h4>请先仔细阅读信息完善指引</h4>
              <div className="profile-content">
              <div className="profile-header">
                <div className="avatar-section">
                  <div className="avatar">{userInfo.avatar}</div>
                </div>
                <div className="user-details">
                  <h3>{userInfo.username}</h3>
                  <p className="user-level">{userInfo.level} 会员</p>
                  <p className="join-date">加入时间：{userInfo.joinDate}</p>
                  <p className="user-level" style={{color: userInfo.is_verified ? '#00ff88' : '#ff6b6b'}}>
                    {userInfo.is_verified ? '已认证账户' : '未认证账户'}
                  </p>
                  {(userInfo.level === '高级用户' || userInfo.user_type === 'premium') && (
                    <p className="user-level" style={{color: '#ffcc00'}}>
                      高级会员 (剩余 {userInfo.premium_days || 0} 天)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>昵称</label>
                  <input 
                    type="text" 
                    value={editingInfo.nickname}
                    onChange={(e) => setEditingInfo({...editingInfo, nickname: e.target.value})}
                    placeholder="请输入昵称"
                  />
                </div>
                <div className="form-group">
                  <label>邮箱</label>
                  <input 
                    type="email" 
                    value={userInfo.email}
                    disabled
                    className="invite-code-display"
                  />
                  <small>邮箱不可修改</small>
                </div>
                <div className="form-group">
                  <label>币安UID</label>
                  <input 
                    type="text" 
                    value={editingInfo.binanceUID || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, binanceUID: e.target.value})}
                    placeholder="请输入您的币安UID"
                  />
                  <small>用于绑定币安交易所账户</small>
                </div>
                <div className="form-group">
                  <label>Bitget UID</label>
                  <input 
                    type="text" 
                    value={editingInfo.bitgetUID || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, bitgetUID: e.target.value})}
                    placeholder="请输入您的Bitget UID"
                  />
                  <small>用于绑定Bitget交易所账户</small>
                </div>
                <div className="form-group">
                  <label>微信号</label>
                  <input 
                    type="text" 
                    value={editingInfo.wechat || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, wechat: e.target.value})}
                    placeholder="请输入您的微信号"
                  />
                  <small>用于客服联系和活动通知</small>
                </div>
                <div className="form-group">
                  <label>OKX UID</label>
                  <input 
                    type="text" 
                    value={editingInfo.okxUID || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, okxUID: e.target.value})}
                    placeholder="请输入您的OKX UID"
                  />
                  <small>用于绑定OKX交易所账户</small>
                </div>
                <div className="form-group">
                  <label>父邀请码</label>
                  <input 
                    type="text" 
                    value={userInfo.parentInviteCode}
                    disabled
                    className="invite-code-display"
                  />
                  <small>注册时使用的邀请码</small>
                </div>
                <div className="form-group">
                  <label>我的邀请码</label>
                  <div className="invite-code-container">
                    <input 
                      type="text" 
                      value={userInfo.myInviteCode}
                      disabled
                      className="invite-code-display"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(userInfo.myInviteCode);
                        Swal.fire({
                          icon: 'success',
                          title: '复制成功！',
                          text: '邀请码已复制到剪贴板',
                          background: '#1e222d',
                          color: '#d1d4dc',
                          confirmButtonColor: '#bfa14a',
                          confirmButtonText: '确定',
                          timer: 1500,
                          timerProgressBar: true,
                          toast: true,
                          position: 'top-end',
                          showConfirmButton: false
                        });
                      }}
                    >
                      复制
                    </button>
                  </div>
                  <small>分享给朋友注册使用</small>
                </div>
                <button className="save-btn" onClick={handleSaveProfile}>保存修改</button>
              </div>
            </div>
          </div>
          )}

          {/* 信息完善指引页面 */}
          {currentPage === 'guide' && (
            <div className="guide-section">
              <h2 className="section-title">注册完成后信息完善指引</h2>
              <div className="guide-content">
                <div className="guide-section-item">
                  <h3>一、注册完成后的信息完善流程</h3>
                  <p>欢迎完成注册！为保障账户安全并充分使用平台功能，请按以下指引完成个人信息完善，流程简洁高效，预计耗时3分钟。</p>
                </div>

                <div className="guide-section-item">
                  <h3>二、分项填写说明</h3>
                  
                  <div className="guide-subsection">
                    <h4>（一）基础身份信息设置</h4>
                    <div className="guide-item">
                      <h5>昵称填写</h5>
                      <p>请在对应字段输入您选择的账户昵称，支持中英文及数字组合，长度为2-12字符。</p>
                      <p className="guide-tip">温馨提示：昵称可在后续自主修改，建议首次设置后保持相对稳定，以便于账户识别与管理。</p>
                    </div>
                    <div className="guide-item">
                      <h5>邮箱绑定</h5>
                      <p>请输入您常用且有效的电子邮箱地址（格式示例：xxx@xx.com）。</p>
                      <p className="guide-tip">重要提示：邮箱为账户关键验证渠道，绑定后不可修改，后续登录、密码找回、系统通知等均通过此邮箱发送，请务必核对无误后再提交。</p>
                    </div>
                  </div>

                  <div className="guide-subsection">
                    <h4>（二）交易所账户关联</h4>
                    <div className="guide-item">
                      <h5>币安UID绑定</h5>
                      <p>登录币安，进入个人中心，获取并输入您的币安UID（纯数字标识，非邮箱或手机号）</p>
                      <div className="guide-link">
                        <a href="https://www.maxweb.black/join?ref=738205337" target="_blank" rel="noopener noreferrer">
                          www.maxweb.cc/join?ref=738205337
                        </a>
                        <span className="invite-code">邀请码：738205337</span>
                      </div>
                    </div>
                    <div className="guide-item">
                      <h5>BGUID绑定</h5>
                      <p>登录Bitget，进入个人中心，获取并输入您的Bitget UID（纯数字标识，非邮箱或手机号）</p>
                      <div className="guide-link">
                        <a href="https://partner.dhxrcw.cn/bg/0998AX" target="_blank" rel="noopener noreferrer">
                          https://partner.dhxrcw.cn/bg/0998AX
                        </a>
                        <span className="invite-code">邀请码：qqvc</span>
                      </div>
                    </div>
                    <div className="guide-item">
                      <h5>OKXUID绑定</h5>
                      <p>登录OKX，进入个人中心，获取并输入您的OKXUID（纯数字标识，非邮箱或手机号）</p>
                      <div className="guide-link">
                        <a href="https://www.xacneo.com/join/63940277" target="_blank" rel="noopener noreferrer">
                          https://www.xacneo.com/join/63940277
                        </a>
                        <span className="invite-code">邀请码：63940277</span>
                      </div>
                    </div>
                  </div>

                  <div className="guide-subsection">
                    <h4>（三）邀请关系确认</h4>
                    <div className="guide-item">
                      <h5>父邀请码填写</h5>
                      <p>若您通过他人邀请注册，烦请在对应字段输入邀请人提供的专属邀请码（无邀请环节则留空，不影响基础功能使用）。</p>
                      <p className="guide-tip">权益说明：邀请码关联可用于追溯推荐关系，后续平台活动或奖励发放将以邀请关系为依据。</p>
                    </div>
                    <div className="guide-item">
                      <h5>我的邀请码生成</h5>
                      <p>完成本次信息完善后，系统将自动生成您的专属邀请码，请妥善保存。邀请好友注册并成功关联您的邀请码后，双方均可获得平台设定的邀请奖励（具体规则以平台公告为准）。</p>
                    </div>
                  </div>
                </div>

                <div className="guide-section-item">
                  <h3>三、提交前重要提示</h3>
                  <div className="guide-item">
                    <h5>信息核对要求</h5>
                    <p>请确保所有绑定的邮箱、交易所UID为本人真实有效信息，虚假信息可能导致账户功能受限或安全风险。</p>
                  </div>
                  <div className="guide-item">
                    <h5>邀请码关联</h5>
                    <p>需确保邀请关系真实，禁止伪造或冒用他人邀请码。</p>
                  </div>
                  <div className="guide-item">
                    <h5>隐私与安全保障</h5>
                    <p>平台严格遵守数据安全与隐私保护法律法规，仅收集注册及功能必需的信息，所有数据均采用加密技术存储，未经授权不得泄露或滥用。</p>
                  </div>
                  <div className="guide-item">
                    <h5>审核与生效时间</h5>
                    <p>信息提交后，系统将在1-3个工作日内完成审核（工作日不包含节假日），审核结果将通过注册邮箱及平台站内信同步通知。</p>
                  </div>
                </div>

                <div className="guide-section-item">
                  <h3>四、完成信息完善后的专属权益</h3>
                  <div className="guide-item">
                    <h5>基础功能激活</h5>
                    <p>绑定交易所UID后，可实时同步账户资产、交易记录，支持平台与交易所间的便捷操作衔接。</p>
                  </div>
                  <div className="guide-item">
                    <h5>邀请奖励权益</h5>
                    <p>成功关联邀请关系后，邀请人可获得推荐奖励（如积分、手续费抵扣券等），被邀请人可领取新人专属福利（具体以平台活动公告为准）。</p>
                  </div>
                  <div className="guide-item">
                    <h5>后续功能升级</h5>
                    <p>完成本次信息完善后，您可逐步解锁平台进阶功能（如实名认证、杠杆交易、智能跟单等），具体开放进度请以账户权限页面显示为准。</p>
                  </div>
                </div>

                <div className="guide-section-item">
                  <h3>五、常见问题咨询</h3>
                  <p>如遇信息填写或系统操作问题，可通过以下方式获取帮助：</p>
                  <p>添加客服微信 <span className="wechat-id">admiraltyz</span>，获取实时人工答疑；</p>
                  <p className="guide-tip">请仔细核对信息后提交，感谢您的配合与支持！祝您使用平台愉快！</p>
                </div>
              </div>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

export default UserProfile; 