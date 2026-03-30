import React, { useState, useEffect } from 'react';
import './Components.css';
import Swal from 'sweetalert2';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import useUserStore from '../store/userStore';

// 商品卡片样式
const styles = {
  itemImage: {
    width: '100%',
    height: '150px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    padding: '20px',
    textAlign: 'center',
    color: '#999'
  },
  errorContainer: {
    padding: '20px',
    textAlign: 'center',
    color: '#ff6b6b'
  },
  retryButton: {
    padding: '8px 16px',
    marginTop: '10px',
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  placeholderImage: {
    fontSize: '40px',
    color: '#555'
  }
};

function PointsExchange() {
  const [activeTab, setActiveTab] = useState('shop');
  // 从userStore获取用户信息和积分
  const { userInfo, updatePoints } = useUserStore();
  const userPoints = userInfo.points || 0;
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplications, setUserApplications] = useState({});
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [userTypeLoading, setUserTypeLoading] = useState(true);
  
  // 检查用户认证状态和用户类型
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!userInfo.id) {
        setVerificationLoading(false);
        setUserTypeLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_verified, user_type')
          .eq('id', userInfo.id)
          .single();
        
        if (error) throw error;
        
        setIsVerified(data.is_verified);
        setUserType(data.user_type || '普通用户');
      } catch (error) {
        console.error('检查用户状态失败:', error);
        setIsVerified(false);
        setUserType('普通用户');
      } finally {
        setVerificationLoading(false);
        setUserTypeLoading(false);
      }
    };
    
    checkUserStatus();
  }, [userInfo.id]);

  // 从Supabase获取积分兑换商品数据
  // 获取用户的兑换申请状态
  const fetchUserApplications = async () => {
    if (!userInfo.id) return;
    
    try {
      setLoadingApplications(true);
      
      const { data, error } = await supabase
        .from('points_exchange_applications')
        .select('*')
        .eq('user_id', userInfo.id);
        
      if (error) throw error;
      
      // 将申请数据转换为以item_id为键的对象，方便查询
      const applications = {};
      data.forEach(app => {
        applications[app.item_id] = app.status;
      });
      
      setUserApplications(applications);
      console.log('用户兑换申请状态:', applications);
      
    } catch (err) {
      console.error('获取用户兑换申请失败:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    const fetchExchangeItems = async () => {
      try {
        setLoading(true);
        
        // 从points_exchange_items表获取商品数据
        const { data, error } = await supabase
          .from('points_exchange_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 将获取到的数据映射到组件所需的格式
        const formattedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || `兑换 ${item.name}`, // 如果没有描述，使用默认描述
          points: item.points_required,
          stock: item.stock,
          image: item.picture, // 使用picture字段作为商品图片
          multipleExchange: item.multiple_exchange,
          createdAt: item.created_at
        }));
        
        setShopItems(formattedItems);
        console.log('获取到的积分商品数据:', formattedItems);
      } catch (err) {
        console.error('获取积分商品数据失败:', err);
        setError(err.message);
        
        // 加载失败时使用默认数据
        setShopItems([
          {
            id: 1,
            name: 'VIP会员月卡',
            description: '享受VIP专属权益，包括优先客服、专属活动等',
            points: 500,
            stock: 10,
            image: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            name: '游领代币',
            description: '兑换游领生态代币，参与生态建设',
            points: 100,
            stock: 999,
            image: 'https://via.placeholder.com/100'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExchangeItems();
    
    // 如果用户已登录，获取用户的兑换申请状态
    if (userInfo.id) {
      fetchUserApplications();
    }
  }, [userInfo.id]);

  // 兑换记录已移除

  // 处理兑换申请
  const handleExchange = async (item) => {
    // 检查是否已有该商品的申请
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      
      // 如果状态是已通过且允许多次兑换，则允许再次申请
      if (status === 'approved' && item.multipleExchange) {
        // 继续执行兑换流程，不返回
      } else {
        // 其他状态显示提示信息
        let statusText = '';
        
        switch(status) {
          case 'pending':
            statusText = '审核中';
            break;
          case 'approved':
            statusText = '已兑换';
            break;
          case 'rejected':
            statusText = '已拒绝';
            break;
          default:
            statusText = status;
        }
        
        Swal.fire({
          icon: 'info',
          title: '已提交申请',
          text: `您已经提交过此商品的兑换申请，当前状态: ${statusText}`,
          background: '#1e222d',
          color: '#d1d4dc',
          confirmButtonColor: '#bfa14a',
          confirmButtonText: '确定'
        });
        return;
      }
    }
    
    if (userPoints >= item.points) {
      Swal.fire({
        title: '确认兑换',
        text: `确定要申请兑换 ${item.name} 吗？`,
        html: `
          <p>商品: ${item.name}</p>
          <p>所需积分: ${item.points}</p>
          <p>提交后将进入审核流程，审核通过后将自动扣除积分。</p>
        `,
        icon: 'question',
        background: '#1e222d',
        color: '#d1d4dc',
        showCancelButton: true,
        confirmButtonColor: '#bfa14a',
        cancelButtonColor: '#666',
        confirmButtonText: '确认申请',
        cancelButtonText: '取消',
        reverseButtons: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // 提交兑换申请到points_exchange_applications表
            const { error } = await supabase
              .from('points_exchange_applications')
              .insert([
                {
                  user_id: userInfo.id,
                  item_id: item.id,
                  status: 'pending',
                  created_at: new Date(),
                  updated_at: new Date()
                }
              ]);
              
            if (error) throw error;
            
            // 更新本地申请状态
            setUserApplications(prev => ({
              ...prev,
              [item.id]: 'pending'
            }));
            
            Swal.fire({
              icon: 'success',
              title: '申请提交成功！',
              text: `您的兑换申请已提交，请等待管理员审核`,
              background: '#1e222d',
              color: '#d1d4dc',
              confirmButtonColor: '#bfa14a',
              confirmButtonText: '确定',
              timer: 2000,
              timerProgressBar: true
            });
          } catch (error) {
            console.error('提交兑换申请失败:', error);
            Swal.fire({
              icon: 'error',
              title: '申请提交失败',
              text: `提交失败: ${error.message || '请稍后重试'}`,
              background: '#1e222d',
              color: '#d1d4dc',
              confirmButtonColor: '#ef5350',
              confirmButtonText: '确定'
            });
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '积分不足',
        text: '您的积分不足，无法兑换此商品',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定',
        timer: 2000,
        timerProgressBar: true
      });
    }
  };

  const renderShopTab = () => (
    <div className="shop-content">
      <div className="points-display">
        <h3>我的积分</h3>
        <div className="points-value">{userPoints}</div>
        <button className="earn-points-btn" onClick={() => setActiveTab('earn')}>赚取积分</button>
      </div>
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <p>正在加载商品信息...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p>加载失败: {error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>重试</button>
        </div>
      ) : (
        <div className="shop-grid">
          {shopItems.map(item => (
            <div key={item.id} className="shop-item">
              <div className="item-image" style={styles.itemImage}>
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'scale-down'
                    }}
                  />
                ) : (
                  <div style={styles.placeholderImage}>🎁</div>
                )}
              </div>
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <div className="item-meta">
                  <span className="points-cost">{item.points} 积分</span>
                </div>
                <div className="item-stock">库存：{item.stock}</div>
              </div>
              <button 
                className="exchange-btn"
                onClick={() => handleExchange(item)}
                disabled={
                  userPoints < item.points || 
                  item.stock === 0 || 
                  userApplications[item.id] === 'pending' || 
                  (userApplications[item.id] === 'approved' && !item.multipleExchange)
                }
              >
                {getButtonText(item)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 兑换记录选项卡已移除

  // 获取按钮显示文本
  const getButtonText = (item) => {
    // 检查是否有该商品的申请记录
    if (userApplications[item.id]) {
      const status = userApplications[item.id];
      switch(status) {
        case 'pending':
          return '审核中';
        case 'approved':
          // 如果已通过审核，根据multiple_exchange决定按钮文本
          return item.multipleExchange ? '再次兑换' : '已兑换';
        case 'rejected':
          return '已拒绝';
        default:
          return status;
      }
    }
    
    // 没有申请记录，显示常规状态
    if (userPoints < item.points) {
      return '积分不足';
    } else if (item.stock === 0) {
      return '已售罄';
    } else {
      return '立即兑换';
    }
  };

  const renderEarnTab = () => (
    <div className="earn-content">
      <div className="earn-header">
        <h3>赚取积分</h3>
        <p>通过以下方式获得更多积分</p>
      </div>
      
      <div className="earn-methods">
        
        
      
        
        <div className="earn-method">
          <div className="method-icon">🎯</div>
          <div className="method-info">
            <h4>完成空投任务</h4>
          </div>
        </div>
        
        <div className="earn-method">
          <div className="method-icon">...</div>
          <div className="method-info">
            <h4>敬请期待</h4>
          </div>
        </div>
      </div>
      
    </div>
  );

  return (
    <div className="component-container">
      {verificationLoading || userTypeLoading ? (
        <div className="loading-container">
          <p>验证用户状态中...</p>
        </div>
      ) : !isVerified ? (
        <div className="verification-required">
          <h2>需要账号验证</h2>
          <p>请先完成账号验证（绑定UID）后再访问此页面</p>
        </div>
      ) : (
        <div className="exchange-layout">
          <div className="exchange-tabs">
            <button 
              className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              积分商城
            </button>
            <button 
              className={`tab-btn ${activeTab === 'earn' ? 'active' : ''}`}
              onClick={() => setActiveTab('earn')}
            >
              赚取积分
            </button>
          </div>
          
          <SimpleBar style={{height: 'calc(100vh - 200px)'}} className="exchange-main">
            {activeTab === 'shop' && renderShopTab()}
            {activeTab === 'earn' && renderEarnTab()}
          </SimpleBar>
        </div>
      )}
    </div>
  );
}

export default PointsExchange; 