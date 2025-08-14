import React, { useState } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {Swal} from 'sweetalert2';

function Airdrop() {
  const [airdrops] = useState([
    {
      id: 1,
      name: '游领代币空投',
      description: '参与游领生态建设，获得代币奖励',
      reward: '100积分',
      deadline: '2024-12-31',
      status: 'upcoming', // 即将开始
      startDate: '2024-12-01'
    },
    {
      id: 2,
      name: '新手福利空投',
      description: '新用户专享',
      reward: '50积分',
      deadline: '2024-11-30',
      status: 'active', // 进行中
      startDate: '2024-11-01'
    },
    {
      id: 3,
      name: '社区贡献空投',
      description: '为社区做出贡献的用户专属奖励',
      reward: '200积分',
      deadline: '2024-10-31',
      status: 'ended', // 已结束
      startDate: '2024-10-01'
    },
    {
      id: 4,
      name: '交易大赛空投',
      description: '参与交易大赛，赢取丰厚奖励',
      reward: '300积分',
      deadline: '2024-12-15',
      status: 'upcoming',
      startDate: '2024-12-10'
    },
    {
      id: 5,
      name: '学习任务空投',
      description: '完成学习任务，获得知识奖励',
      reward: '80积分',
      deadline: '2024-11-20',
      status: 'active',
      startDate: '2024-11-05'
    },
   
    {
      id: 5,
      name: '学习任务空投',
      description: '完成学习任务，获得知识奖励',
      reward: '80积分',
      deadline: '2024-11-20',
      status: 'active',
      startDate: '2024-11-05'
    },
    {
      id: 6,
      name: '邀请好友空投',
      description: '邀请好友注册，双方获得奖励',
      reward: '150积分',
      deadline: '2024-10-15',
      status: 'ended',
      startDate: '2024-10-01'
    }
  ]);

  const [selectedAirdrop, setSelectedAirdrop] = useState(null);

  // 按状态优先级排序：即将开始 > 进行中 > 已结束
  const sortedAirdrops = airdrops.sort((a, b) => {
    const statusOrder = { 'upcoming': 0, 'active': 1, 'ended': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleParticipate = (airdrop) => {
    setSelectedAirdrop(airdrop);
  };

  const closeTutorial = () => {
    setSelectedAirdrop(null);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'upcoming': return '即将开始';
      case 'active': return '进行中';
      case 'ended': return '已结束';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return '#ffd700';
      case 'active': return '#00ff88';
      case 'ended': return '#ff6b6b';
      default: return '#999';
    }
  };

  return (
    <div className="component-container">
      <div className="airdrop-layout">
        <SimpleBar style={{height: 'calc(100vh - 200px)'}} className="airdrop-list">
          <h2 className="section-title">空投活动</h2>
          <div className="airdrop-grid">
            {sortedAirdrops.map(airdrop => (
              <div key={airdrop.id} className={`airdrop-card ${airdrop.status}`}>
                <div className="airdrop-header">
                  <h3>{airdrop.name}</h3>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(airdrop.status) }}
                  >
                    {getStatusText(airdrop.status)}
                  </span>
                </div>
                <p className="airdrop-description">{airdrop.description}</p>
                <div className="airdrop-details">
                  <div className="reward">
                    <span className="label">奖励：</span>
                    <span className="value">{airdrop.reward}</span>
                  </div>
                  <div className="deadline">
                    <span className="label">截止：</span>
                    <span className="value">{airdrop.deadline}</span>
                  </div>
                  <div className="start-date">
                    <span className="label">开始：</span>
                    <span className="value">{airdrop.startDate}</span>
                  </div>
                </div>
                {airdrop.status === 'active' && (
                  <button 
                    className="participate-btn"
                    onClick={() => handleParticipate(airdrop)}
                  >
                    立即参与
                  </button>
                )}
                {airdrop.status === 'upcoming' && (
                  <button className="upcoming-btn" disabled>
                    即将开始
                  </button>
                )}
                {airdrop.status === 'ended' && (
                  <button className="ended-btn" disabled>
                    已结束
                  </button>
                )}
              </div>
            ))}
          </div>
        </SimpleBar>

        {selectedAirdrop && (
          <div className="tutorial-panel">
            <div className="tutorial-header">
              <h3>{selectedAirdrop.name} - 任务教程</h3>
              <button className="close-btn" onClick={closeTutorial}>×</button>
            </div>
            <SimpleBar style={{height: 'calc(100vh - 200px)'}} className="tutorial-content tutorial-scroll">
              
              
              <div className="tutorial-section">
                <h4 className="tutorial-subtitle">📋 任务要求</h4>
                <p className="tutorial-text">
                  完成以下任务即可获得 <span className="highlight-reward">{selectedAirdrop.reward}</span> 奖励：
                </p>
                <ul className="task-list">
                  <li>完成账户实名认证</li>
                  <li>完成基础交易操作</li>
                  <li>参与社区讨论</li>
                  <li>邀请好友注册</li>
                </ul>
              </div>

              <div className="tutorial-section">
                <h4 className="tutorial-subtitle">🎯 详细步骤</h4>
                <div className="step-item">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h5>账户认证</h5>
                    <p>进入个人中心，完成实名认证流程，上传身份证照片。</p>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h5>基础交易</h5>
                    <p>完成至少一笔交易操作，熟悉平台交易流程。</p>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h5>社区参与</h5>
                    <p>在社区中发表有价值的观点，获得其他用户认可。</p>
                  </div>
                </div>
              </div>

              <div className="tutorial-section">
                <h4 className="tutorial-subtitle">⚠️ 注意事项</h4>
                <div className="warning-box">
                  <p>• 任务必须在截止日期前完成</p>
                  <p>• 每个账户只能参与一次</p>
                </div>
              </div>

              <button className="start-task-btn">
                开始任务
              </button>
            </SimpleBar>
          </div>
        )}
      </div>
    </div>
  );
}

export default Airdrop; 