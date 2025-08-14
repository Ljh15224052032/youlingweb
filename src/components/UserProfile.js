import React, { useState, useRef, useEffect } from 'react';
import useUserStore from '../store/userStore';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabaseClient';


function UserProfile() {
  const { userInfo, updateUserInfo, logout } = useUserStore();
  const [editingInfo, setEditingInfo] = useState({ 
    ...userInfo,
    nickname: userInfo.nickname || '',
    binanceUID: userInfo.binanceUID || '',
    bitgetUID: userInfo.bitgetUID || ''
  });

  const profileRef = useRef(null);

  // 同步userInfo的变化到editingInfo
  useEffect(() => {
    setEditingInfo({
      ...userInfo,
      nickname: userInfo.nickname || '',
      binanceUID: userInfo.binanceUID || '',
      bitgetUID: userInfo.bitgetUID || ''
    });
  }, [userInfo]);

  const handleSaveProfile = async () => {
    try {
      console.log('准备更新数据:', {
        nickname: editingInfo.nickname,
        binance_uid: editingInfo.binanceUID || null,
        bg_uid: editingInfo.bitgetUID || null,
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

  const scrollToSection = (ref) => {
    if (ref.current) {
      const element = ref.current;
      const container = element.closest('.profile-main');
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // 计算滚动位置，留出一些顶部空间
      const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 20;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="component-container">
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="user-summary">
            <div className="user-avatar">{userInfo.avatar}</div>
            <h3>{userInfo.username}</h3>
            <p className="user-level">{userInfo.level}</p>
            <div className="points-display">
              <span>积分：{userInfo.points}</span>
            </div>
          </div>
          
          <nav className="profile-nav">
            <button 
              className="nav-btn"
              onClick={() => scrollToSection(profileRef)}
            >
              个人信息
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
          {/* 个人信息部分 */}
          <div ref={profileRef} className="profile-section">
            <h2 className="section-title">个人信息</h2>
            <div className="profile-content">
              <div className="profile-header">
                <div className="avatar-section">
                  <div className="avatar">{userInfo.avatar}</div>
                </div>
                <div className="user-details">
                  <h3>{userInfo.username}</h3>
                  <p className="user-level">{userInfo.level} 会员</p>
                  <p className="join-date">加入时间：{userInfo.joinDate}</p>
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
        </SimpleBar>
      </div>
    </div>
  );
}

export default UserProfile; 