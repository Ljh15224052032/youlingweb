import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import useUserStore from '../store/userStore';

function PointsExchange() {
  const [activeTab, setActiveTab] = useState('shop');
  const { userInfo, updatePoints, fetchUserByUsername } = useUserStore();
  const userPoints = userInfo.points || 0;
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplications, setUserApplications] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);

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

  const fetchUserApplications = async () => {
    if (!userInfo.id) return;
    try {
      const { data, error } = await supabase
        .from('points_exchange_applications')
        .select('*')
        .eq('user_id', userInfo.id);
      if (error) throw error;
      const applications = {};
      data.forEach(app => {
        applications[app.item_id] = app.status;
      });
      setUserApplications(applications);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const fetchExchangeItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('points_exchange_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setShopItems(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeItems();
    if (userInfo.id) {
      fetchUserApplications();
    }
  }, [userInfo.id]);

  const handleExchange = async (item) => {
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      if (status === 'approved' && item.multiple_exchange) {
        // 允许再次兑换
      } else {
        const statusText = { pending: '审核中', approved: '已兑换', rejected: '已拒绝' }[status] || status;
        Swal.fire({
          icon: 'info', title: '已提交申请',
          text: `您已提交过此商品的兑换申请，当前状态: ${statusText}`,
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#bfa14a', confirmButtonText: '确定',
        });
        return;
      }
    }

    if (userPoints < item.points_required) {
      Swal.fire({
        icon: 'error', title: '积分不足',
        text: `需要 ${item.points_required} 积分，当前 ${userPoints} 积分`,
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: '确定',
        timer: 2000, timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      title: '确认兑换',
      html: `
        <div style="text-align:left;line-height:2">
          <p><b>商品：</b>${item.name}</p>
          <p><b>所需积分：</b>${item.points_required}</p>
          <p style="color:rgba(255,255,255,0.5);font-size:0.85rem">提交后将进入审核流程，审核通过后自动扣除积分</p>
        </div>
      `,
      icon: 'question',
      background: '#1e222d', color: '#d1d4dc',
      showCancelButton: true,
      confirmButtonColor: '#bfa14a', cancelButtonColor: '#666',
      confirmButtonText: '确认申请', cancelButtonText: '取消',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const { error } = await supabase
          .from('points_exchange_applications')
          .insert([{
            user_id: userInfo.id,
            item_id: item.id,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          }]);
        if (error) throw error;

        setUserApplications(prev => ({ ...prev, [item.id]: 'pending' }));

        // 刷新积分
        if (userInfo.email) {
          await fetchUserByUsername(userInfo.email);
        }

        Swal.fire({
          icon: 'success', title: '申请提交成功',
          text: '请等待管理员审核',
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#bfa14a', confirmButtonText: '确定',
          timer: 2000, timerProgressBar: true,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error', title: '提交失败',
          text: err?.message || '请稍后重试',
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#ef5350', confirmButtonText: '确定',
        });
      }
    });
  };

  const getButtonText = (item) => {
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      if (status === 'pending') return '审核中';
      if (status === 'approved') return item.multiple_exchange ? '再次兑换' : '已兑换';
      if (status === 'rejected') return '重新申请';
      return status;
    }
    if (userPoints < item.points_required) return '积分不足';
    if (item.stock === 0) return '已售罄';
    return '立即兑换';
  };

  const isButtonDisabled = (item) => {
    if (userPoints < item.points_required) return true;
    if (item.stock === 0) return true;
    if (userApplications[item.id] === 'pending') return true;
    if (userApplications[item.id] === 'approved' && !item.multiple_exchange) return true;
    return false;
  };

  const earnMethods = [
    { icon: '📝', title: '注册账号', desc: '完成注册即送 50 积分', points: '+50' },
    { icon: '✉️', title: '绑定邮箱', desc: '验证邮箱后获得奖励', points: '+20' },
    { icon: '🎯', title: '完成空投任务', desc: '参与空投活动并通过审核', points: '根据活动' },
    { icon: '👥', title: '邀请好友', desc: '好友通过你的邀请码注册', points: '+30/人' },
    { icon: '📖', title: '每日学习', desc: '每日阅读新手指南或合约教学', points: '+5/天' },
  ];

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
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
        {/* 积分显示 + Tab */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{
            background: 'rgba(24,24,26,0.9)',
            border: '1px solid rgba(191,161,74,0.2)',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>我的积分</span>
            <span style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: 700 }}>{userPoints}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', border: 'none',
                background: activeTab === 'shop' ? 'rgba(191,161,74,0.25)' : 'transparent',
                color: activeTab === 'shop' ? '#ffd700' : 'rgba(255,255,255,0.5)',
              }}
            >积分商城</button>
            <button
              onClick={() => setActiveTab('earn')}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', border: 'none',
                background: activeTab === 'earn' ? 'rgba(191,161,74,0.25)' : 'transparent',
                color: activeTab === 'earn' ? '#ffd700' : 'rgba(255,255,255,0.5)',
              }}
            >赚取积分</button>
          </div>
        </div>

        <SimpleBar style={{ height: 'calc(100vh - 220px)' }}>
          {activeTab === 'shop' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>加载中...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ff6b6b' }}>
                <p>加载失败：{error}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: '#fff', cursor: 'pointer' }}>重试</button>
              </div>
            ) : shopItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>暂无可兑换商品</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {shopItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(24,24,26,0.9)',
                      border: '1px solid rgba(191,161,74,0.15)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(191,161,74,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(191,161,74,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(191,161,74,0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      {item.picture ? (
                        <img src={item.picture} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'scale-down' }} />
                      ) : (
                        <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>🎁</span>
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.3rem', color: '#ffd700', fontSize: '0.95rem' }}>{item.name}</h4>
                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#ffd700', fontWeight: 600, fontSize: '0.95rem' }}>{item.points_required} 积分</span>
                        <span style={{ fontSize: '0.8rem', color: item.stock > 0 ? 'rgba(255,255,255,0.3)' : '#ff6b6b' }}>
                          库存 {item.stock}
                        </span>
                      </div>
                      <button
                        onClick={() => handleExchange(item)}
                        disabled={isButtonDisabled(item)}
                        style={{
                          width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none',
                          background: isButtonDisabled(item) ? 'rgba(255,255,255,0.05)' : 'rgba(191,161,74,0.15)',
                          color: isButtonDisabled(item) ? 'rgba(255,255,255,0.3)' : '#ffd700',
                          fontSize: '0.85rem', cursor: isButtonDisabled(item) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {getButtonText(item)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'earn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {earnMethods.map((method, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(24,24,26,0.9)',
                    border: '1px solid rgba(191,161,74,0.1)',
                    borderRadius: '10px',
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ffd700', fontSize: '0.95rem', fontWeight: 500 }}>{method.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{method.desc}</div>
                  </div>
                  <span style={{ color: '#00ff88', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{method.points}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                更多赚取积分的方式即将开放
              </div>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

export default PointsExchange;
