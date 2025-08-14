import React, { useState } from 'react';
import './Components.css';
import Swal from 'sweetalert2';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function PointsExchange() {
  const [activeTab, setActiveTab] = useState('shop');
  const [userPoints, setUserPoints] = useState(1250);
  const [shopItems] = useState([
    {
      id: 1,
      name: 'VIP会员月卡',
      description: '享受VIP专属权益，包括优先客服、专属活动等',
      points: 500,
      originalPrice: 50,
      stock: 10,
      image: '👑'
    },
    {
      id: 2,
      name: '游领代币',
      description: '兑换游领生态代币，参与生态建设',
      points: 100,
      originalPrice: 10,
      stock: 999,
      image: '🪙'
    },
    {
      id: 3,
      name: '专属头像框',
      description: '独特的头像装饰，彰显您的身份',
      points: 200,
      originalPrice: 20,
      stock: 50,
      image: '🖼️'
    },
    {
      id: 4,
      name: '学习资料包',
      description: '包含最新的区块链学习资料和教程',
      points: 300,
      originalPrice: 30,
      stock: 25,
      image: '📚'
    }
  ]);

  const [exchangeHistory] = useState([
    {
      id: 1,
      itemName: 'VIP会员月卡',
      points: 500,
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      itemName: '游领代币',
      points: 100,
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: 3,
      itemName: '专属头像框',
      points: 200,
      date: '2024-01-05',
      status: 'processing'
    }
  ]);

  const handleExchange = (item) => {
    if (userPoints >= item.points) {
      Swal.fire({
        title: '确认兑换',
        text: `确定要兑换 ${item.name} 吗？将消耗 ${item.points} 积分`,
        icon: 'question',
        background: '#1e222d',
        color: '#d1d4dc',
        showCancelButton: true,
        confirmButtonColor: '#bfa14a',
        cancelButtonColor: '#666',
        confirmButtonText: '确认兑换',
        cancelButtonText: '取消',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          setUserPoints(userPoints - item.points);
          Swal.fire({
            icon: 'success',
            title: '兑换成功！',
            text: `${item.name} 已添加到您的账户`,
            background: '#1e222d',
            color: '#d1d4dc',
            confirmButtonColor: '#bfa14a',
            confirmButtonText: '确定',
            timer: 2000,
            timerProgressBar: true
          });
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
        <button className="earn-points-btn">赚取积分</button>
      </div>
      
      <div className="shop-grid">
        {shopItems.map(item => (
          <div key={item.id} className="shop-item">
            <div className="item-image">{item.image}</div>
            <div className="item-info">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <div className="item-meta">
                <span className="points-cost">{item.points} 积分</span>
                <span className="original-price">原价：¥{item.originalPrice}</span>
              </div>
              <div className="item-stock">库存：{item.stock}</div>
            </div>
            <button 
              className="exchange-btn"
              onClick={() => handleExchange(item)}
              disabled={userPoints < item.points || item.stock === 0}
            >
              {userPoints < item.points ? '积分不足' : item.stock === 0 ? '已售罄' : '立即兑换'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="history-content">
      <div className="history-header">
        <h3>兑换记录</h3>
        <div className="history-stats">
          <span>总兑换：{exchangeHistory.length} 次</span>
          <span>总消耗：{exchangeHistory.reduce((sum, item) => sum + item.points, 0)} 积分</span>
        </div>
      </div>
      
      <div className="history-list">
        {exchangeHistory.map(record => (
          <div key={record.id} className="history-item">
            <div className="history-info">
              <h4>{record.itemName}</h4>
              <p>消耗积分：{record.points}</p>
              <p>兑换时间：{record.date}</p>
            </div>
            <div className="history-status">
              <span className={`status-badge ${record.status}`}>
                {record.status === 'completed' ? '已完成' : '处理中'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
  
      
      <div className="exchange-layout">
        <div className="exchange-tabs">
          <button 
            className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            积分商城
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            兑换记录
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
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'earn' && renderEarnTab()}
        </SimpleBar>
      </div>
    </div>
  );
}

export default PointsExchange; 