import React, { useState, useEffect } from 'react';
import './Components.css';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useUserStore from '../store/userStore';

// 添加内联样式，确保正确显示图片和Markdown内容
const styles = {
  guideImage: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  featuredImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    display: 'block'
  }
};

function NewbieGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [userTypeLoading, setUserTypeLoading] = useState(true);
  
  // 从userStore获取用户信息
  const { userInfo } = useUserStore();
  
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

  // 从Supabase获取新手指南数据
  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true);
        
        // 注意: 根据表结构，分类直接存储在newbie_guides表的category字段，不需要关联查询
        
        // 获取新手指南
        const { data, error } = await supabase
          .from('newbie_guides')
          .select(`
            id,
            title,
            content,
            category,
            cover_image,
            created_at
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 处理获取到的数据
        const processedGuides = data.map(guide => ({
          id: guide.id,
          title: guide.title,
          content: guide.content,
          imageUrl: guide.cover_image,
          category: guide.category || '未分类',
          createdAt: guide.created_at
        }));
        
        setGuides(processedGuides);
        console.log('获取到的新手指南:', processedGuides);
      } catch (err) {
        console.error('获取新手指南失败:', err);
        setError(err.message);
        
        // 加载失败时使用默认数据
        setGuides([
          {
            id: 1,
            title: '区块链基础知识',
            category: '基础',
            content: '了解区块链的基本概念、工作原理和技术特点',
            imageUrl: null
          },
          {
            id: 2,
            title: '加密货币投资入门',
            category: '投资',
            content: '学习如何安全地进行加密货币投资，风险管理策略',
            imageUrl: null
          },
          {
            id: 3,
            title: 'DeFi 生态系统介绍',
            category: 'DeFi',
            content: '深入了解去中心化金融的各个组成部分和应用场景',
            imageUrl: null
          },
          {
            id: 4,
            title: 'NFT 市场指南',
            category: 'NFT',
            content: 'NFT 的创建、交易和投资策略详解',
            imageUrl: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadGuides();
  }, []);

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
      {verificationLoading || userTypeLoading ? (
        <div className="loading-container">
          <p>验证用户状态中...</p>
        </div>
      ) : !isVerified ? (
        <div className="verification-required">
          <h2>需要账号验证</h2>
          <p>请先完成账号验证（绑定UID）后后再访问此页面</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <p>正在加载新手指南...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>加载失败: {error}</p>
        </div>
      ) : (
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
                  
                  {/* 显示图片 */}
                  {guide.imageUrl && (
                    <div className="guide-image" style={styles.guideImage}>
                      <img 
                        src={guide.imageUrl} 
                        alt={guide.title} 
                        className="guide-featured-image" 
                        style={styles.featuredImage}
                      />
                    </div>
                  )}
                  
                  {/* Markdown内容渲染 */}
                  <div className="guide-content markdown-content">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {guide.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewbieGuide; 