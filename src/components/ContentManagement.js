import React, { useState } from 'react';
import './Components.css';

function ContentManagement() {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles] = useState([
    {
      id: 1,
      title: '比特币价格分析：技术面与基本面',
      status: 'published',
      views: 1250,
      likes: 89,
      publishDate: '2024-01-15',
      category: '分析'
    },
    {
      id: 2,
      title: 'DeFi 项目投资指南',
      status: 'draft',
      views: 0,
      likes: 0,
      publishDate: null,
      category: '指南'
    },
    {
      id: 3,
      title: 'NFT 市场趋势报告',
      status: 'published',
      views: 890,
      likes: 67,
      publishDate: '2024-01-10',
      category: '报告'
    }
  ]);

  const [videos] = useState([
    {
      id: 1,
      title: '智能合约开发教程',
      status: 'published',
      views: 2340,
      duration: '15:30',
      publishDate: '2024-01-12',
      category: '教程'
    },
    {
      id: 2,
      title: '加密货币投资策略',
      status: 'processing',
      views: 0,
      duration: '22:15',
      publishDate: null,
      category: '策略'
    }
  ]);

  const handlePublish = (id, type) => {
    alert(`${type} ${id} 已发布`);
  };

  const handleEdit = (id, type) => {
    alert(`编辑 ${type} ${id}`);
  };

  const handleDelete = (id, type) => {
    if (window.confirm(`确定要删除这个${type}吗？`)) {
      alert(`${type} ${id} 已删除`);
    }
  };

  const renderArticlesTab = () => (
    <div className="content-list">
      <div className="content-header">
        <h3>文章管理</h3>
        <button className="add-btn">新建文章</button>
      </div>
      
      <div className="content-table">
        <div className="table-header">
          <span>标题</span>
          <span>分类</span>
          <span>状态</span>
          <span>浏览量</span>
          <span>点赞数</span>
          <span>发布时间</span>
          <span>操作</span>
        </div>
        
        {articles.map(article => (
          <div key={article.id} className="table-row">
            <span className="title">{article.title}</span>
            <span className="category">{article.category}</span>
            <span className={`status ${article.status}`}>
              {article.status === 'published' ? '已发布' : '草稿'}
            </span>
            <span className="views">{article.views}</span>
            <span className="likes">{article.likes}</span>
            <span className="date">{article.publishDate || '-'}</span>
            <div className="actions">
              {article.status === 'draft' && (
                <button onClick={() => handlePublish(article.id, '文章')}>发布</button>
              )}
              <button onClick={() => handleEdit(article.id, '文章')}>编辑</button>
              <button onClick={() => handleDelete(article.id, '文章')}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVideosTab = () => (
    <div className="content-list">
      <div className="content-header">
        <h3>视频管理</h3>
        <button className="add-btn">上传视频</button>
      </div>
      
      <div className="content-table">
        <div className="table-header">
          <span>标题</span>
          <span>分类</span>
          <span>状态</span>
          <span>浏览量</span>
          <span>时长</span>
          <span>发布时间</span>
          <span>操作</span>
        </div>
        
        {videos.map(video => (
          <div key={video.id} className="table-row">
            <span className="title">{video.title}</span>
            <span className="category">{video.category}</span>
            <span className={`status ${video.status}`}>
              {video.status === 'published' ? '已发布' : '处理中'}
            </span>
            <span className="views">{video.views}</span>
            <span className="duration">{video.duration}</span>
            <span className="date">{video.publishDate || '-'}</span>
            <div className="actions">
              {video.status === 'processing' && (
                <button onClick={() => handlePublish(video.id, '视频')}>发布</button>
              )}
              <button onClick={() => handleEdit(video.id, '视频')}>编辑</button>
              <button onClick={() => handleDelete(video.id, '视频')}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="analytics-content">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>总浏览量</h4>
          <div className="analytics-value">12,450</div>
          <p className="analytics-change positive">+15.3%</p>
        </div>
        <div className="analytics-card">
          <h4>总点赞数</h4>
          <div className="analytics-value">1,234</div>
          <p className="analytics-change positive">+8.7%</p>
        </div>
        <div className="analytics-card">
          <h4>发布内容</h4>
          <div className="analytics-value">25</div>
          <p className="analytics-change positive">+3</p>
        </div>
        <div className="analytics-card">
          <h4>草稿数量</h4>
          <div className="analytics-value">8</div>
          <p className="analytics-change neutral">0</p>
        </div>
      </div>
      
      <div className="popular-content">
        <h4>热门内容</h4>
        <div className="popular-list">
          <div className="popular-item">
            <span className="rank">1</span>
            <span className="title">比特币价格分析：技术面与基本面</span>
            <span className="views">1,250 浏览</span>
          </div>
          <div className="popular-item">
            <span className="rank">2</span>
            <span className="title">智能合约开发教程</span>
            <span className="views">2,340 浏览</span>
          </div>
          <div className="popular-item">
            <span className="rank">3</span>
            <span className="title">NFT 市场趋势报告</span>
            <span className="views">890 浏览</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="component-container">
      
      
      <div className="content-layout">
        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            文章管理
          </button>
          <button 
            className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            视频管理
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            数据分析
          </button>
        </div>
        
        <div className="content-main">
          {activeTab === 'articles' && renderArticlesTab()}
          {activeTab === 'videos' && renderVideosTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
}

export default ContentManagement; 