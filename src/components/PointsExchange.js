import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import useUserStore from '../store/userStore';
import { escapeHtml } from '../utils/sanitize';
import { useLang } from '../i18n/context';

function PointsExchange() {
  const [activeTab, setActiveTab] = useState('shop');
  const { userInfo, fetchUserByUsername } = useUserStore();
  const userPoints = userInfo.points || 0;
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplications, setUserApplications] = useState({});
  const isVerified = userInfo.is_verified;
  const { t } = useLang();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo.id]);

  const handleExchange = async (item) => {
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      if (status === 'approved' && item.multiple_exchange) {
        // 允许再次兑换
      } else {
        const statusText = { pending: t('pointsExchange.statusPending'), approved: t('pointsExchange.statusApproved'), rejected: t('pointsExchange.statusRejected') }[status] || status;
        Swal.fire({
          icon: 'info', title: t('pointsExchange.submitted'),
          text: t('pointsExchange.submittedMsg').replace('{status}', statusText),
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#bfa14a', confirmButtonText: t('pointsExchange.confirm'),
        });
        return;
      }
    }

    if (userPoints < item.points_required) {
      Swal.fire({
        icon: 'error', title: t('pointsExchange.insufficientPoints'),
        text: t('pointsExchange.insufficientPointsMsg').replace('{required}', item.points_required).replace('{current}', userPoints),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: t('pointsExchange.confirm'),
        timer: 2000, timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      title: t('pointsExchange.confirmExchange'),
      html: `
        <div style="text-align:left;line-height:2">
          <p><b>${t('pointsExchange.product')}</b>${escapeHtml(item.name)}</p>
          <p><b>${t('pointsExchange.pointsRequired')}</b>${escapeHtml(item.points_required)}</p>
          <p style="color:rgba(255,255,255,0.5);font-size:0.85rem">${t('pointsExchange.exchangeNote')}</p>
        </div>
      `,
      icon: 'question',
      background: '#1e222d', color: '#d1d4dc',
      showCancelButton: true,
      confirmButtonColor: '#bfa14a', cancelButtonColor: '#666',
      confirmButtonText: t('pointsExchange.confirmApply'), cancelButtonText: t('pointsExchange.cancel'),
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
          icon: 'success', title: t('pointsExchange.applySuccess'),
          text: t('pointsExchange.applySuccessMsg'),
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#bfa14a', confirmButtonText: t('pointsExchange.confirm'),
          timer: 2000, timerProgressBar: true,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error', title: t('pointsExchange.applyFailed'),
          text: err?.message || t('pointsExchange.retryLater'),
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#ef5350', confirmButtonText: t('pointsExchange.confirm'),
        });
      }
    });
  };

  const getButtonText = (item) => {
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      if (status === 'pending') return t('pointsExchange.statusPending');
      if (status === 'approved') return item.multiple_exchange ? t('pointsExchange.exchangeAgain') : t('pointsExchange.statusApproved');
      if (status === 'rejected') return t('pointsExchange.reapply');
      return status;
    }
    if (userPoints < item.points_required) return t('pointsExchange.insufficient');
    if (item.stock === 0) return t('pointsExchange.soldOut');
    return t('pointsExchange.exchangeNow');
  };

  const isButtonDisabled = (item) => {
    if (userPoints < item.points_required) return true;
    if (item.stock === 0) return true;
    if (userApplications[item.id] === 'pending') return true;
    if (userApplications[item.id] === 'approved' && !item.multiple_exchange) return true;
    return false;
  };

  const earnMethods = [
    { icon: '📝', title: t('pointsExchange.earnRegister'), desc: t('pointsExchange.earnRegisterDesc'), points: t('pointsExchange.earnRegisterPoints') },
    { icon: '✉️', title: t('pointsExchange.earnEmail'), desc: t('pointsExchange.earnEmailDesc'), points: t('pointsExchange.earnEmailPoints') },
    { icon: '🎯', title: t('pointsExchange.earnAirdrop'), desc: t('pointsExchange.earnAirdropDesc'), points: t('pointsExchange.earnAirdropPoints') },
    { icon: '👥', title: t('pointsExchange.earnInvite'), desc: t('pointsExchange.earnInviteDesc'), points: t('pointsExchange.earnInvitePoints') },
    { icon: '📖', title: t('pointsExchange.earnDaily'), desc: t('pointsExchange.earnDailyDesc'), points: t('pointsExchange.earnDailyPoints') },
  ];

  if (!isVerified) {
    return (
      <div className="component-container">
        <div className="verification-required">
          <h2>{t('pointsExchange.needVerifyTitle')}</h2>
          <p>{t('pointsExchange.needVerifyDesc')}</p>
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
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{t('pointsExchange.myPoints')}</span>
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
            >{t('pointsExchange.shopTab')}</button>
            <button
              onClick={() => setActiveTab('earn')}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', border: 'none',
                background: activeTab === 'earn' ? 'rgba(191,161,74,0.25)' : 'transparent',
                color: activeTab === 'earn' ? '#ffd700' : 'rgba(255,255,255,0.5)',
              }}
            >{t('pointsExchange.earnTab')}</button>
          </div>
        </div>

        <SimpleBar style={{ height: 'calc(100vh - 220px)' }}>
          {activeTab === 'shop' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>{t('pointsExchange.loading')}</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ff6b6b' }}>
                <p>{t('pointsExchange.loadFailed')}{error}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: '#fff', cursor: 'pointer' }}>{t('pointsExchange.retry')}</button>
              </div>
            ) : shopItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>{t('pointsExchange.noItems')}</div>
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
                        <span style={{ color: '#ffd700', fontWeight: 600, fontSize: '0.95rem' }}>{item.points_required} {t('pointsExchange.pointsUnit')}</span>
                        <span style={{ fontSize: '0.8rem', color: item.stock > 0 ? 'rgba(255,255,255,0.3)' : '#ff6b6b' }}>
                          {t('pointsExchange.stock')} {item.stock}
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
                {t('pointsExchange.moreWays')}
              </div>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

export default PointsExchange;
