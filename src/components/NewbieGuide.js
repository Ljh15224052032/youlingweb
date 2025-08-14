import React, { useState } from 'react';
import './Components.css';

function NewbieGuide() {
  const [guides] = useState([
    {
      id: 1,
      title: '区块链基础知识',
      category: '基础',
      content: '了解区块链的基本概念、工作原理和技术特点',
      difficulty: '入门',
      duration: '30分钟'
    },
    {
      id: 2,
      title: '加密货币投资入门',
      category: '投资',
      content: '学习如何安全地进行加密货币投资，风险管理策略',
      difficulty: '初级',
      duration: '45分钟'
    },
    {
      id: 3,
      title: 'DeFi 生态系统介绍',
      category: 'DeFi',
      content: '深入了解去中心化金融的各个组成部分和应用场景',
      difficulty: '中级',
      duration: '60分钟'
    },
    {
      id: 4,
      title: 'NFT 市场指南',
      category: 'NFT',
      content: 'NFT 的创建、交易和投资策略详解',
      difficulty: '初级',
      duration: '40分钟'
    }
  ]);

  const [expandedGuide, setExpandedGuide] = useState(null);

  const handleGuideClick = (guide) => {
    if (expandedGuide?.id === guide.id) {
      setExpandedGuide(null);
    } else {
      setExpandedGuide(guide);
    }
  };

  return (
    <div className="component-container">
      <div className="guide-container">
        {guides.map(guide => (
          <div key={guide.id} className="guide-item-wrapper">
            <div 
              className={`guide-item ${expandedGuide?.id === guide.id ? 'active' : ''}`}
              onClick={() => handleGuideClick(guide)}
            >
              <div className="guide-header">
                <h3>{guide.title}</h3>
                <span className="category-badge">{guide.category}</span>
              </div>
            </div>
            
            {expandedGuide?.id === guide.id && (
              <div className="guide-detail-expanded">
                <div className="guide-info">
                  <span className="category">分类：{guide.category}</span>
                </div>
                <div className="guide-content">
                  <p>{guide.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewbieGuide; 