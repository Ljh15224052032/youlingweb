import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useUserStore from '../store/userStore';

function ContractTutorial() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [userTypeLoading, setUserTypeLoading] = useState(true);
  
  // 从userStore获取用户信息
  const { userInfo } = useUserStore();
  
  // 检查用户认证状态和用户类型
  const checkUserStatus = async () => {
    if (!userInfo.id) {
      setVerificationLoading(false);
      setUserTypeLoading(false);
      return;
    }
    
    try {
      setVerificationLoading(true);
      setUserTypeLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('is_verified, user_type')
        .eq('id', userInfo.id)
        .single();
      
      if (error) throw error;
      
      const verified = data.is_verified;
      const type = data.user_type || '普通用户';
      
      setIsVerified(verified);
      setUserType(type);
    } catch (error) {
      console.error('检查用户状态失败:', error);
      setIsVerified(false);
      setUserType('普通用户');
    } finally {
      setVerificationLoading(false);
      setUserTypeLoading(false);
    }
  };
  
  // 每次组件渲染时检查用户状态
  useEffect(() => {
    checkUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo.id]);

  // 从Supabase获取合约教学数据
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        
        // 获取合约教学数据
        const { data, error } = await supabase
          .from('contract_tutorials')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 处理获取到的数据
        const processedTutorials = data.map(tutorial => {
          // 解析标签数据 - 根据提供的SQL格式: "{\"入门\"]}"
          let tags = [];
          try {
            if (tutorial.tags) {
              let tagsString = tutorial.tags;
              
              // 尝试匹配格式中的标签
              const tagMatch = tagsString.match(/"([^"]+)"/);
              if (tagMatch && tagMatch[1]) {
                tags = [tagMatch[1]];
              } else if (typeof tagsString === 'string') {
                // 尝试常规JSON解析
                try {
                  const parsedTags = JSON.parse(tagsString);
                  if (Array.isArray(parsedTags)) {
                    tags = parsedTags;
                  } else if (typeof parsedTags === 'object') {
                    tags = Object.values(parsedTags);
                  } else {
                    tags = [String(parsedTags)];
                  }
                } catch (jsonError) {
                  // JSON解析失败，使用正则提取引号内内容
                  const matches = tagsString.match(/"([^"]+)"/g);
                  if (matches) {
                    tags = matches.map(m => m.replace(/"/g, ''));
                  }
                }
              }
            }
          } catch (e) {
            console.error('解析标签失败:', e, tutorial.tags);
          }

          // 选择第一个标签作为level，如果没有则默认为"基础"
          const level = tags && tags.length > 0 ? tags[0] : '基础';
          
          // 提取内容前50个字符作为描述
          const description = tutorial.content 
            ? tutorial.content.replace(/[!#*[\]()`]/g, '').substring(0, 50) + '...'
            : '暂无描述';
          
          return {
            id: tutorial.id,
            title: tutorial.title || '无标题教程',
            level: level,
            description: description,
            content: tutorial.content || '暂无内容',
            created_at: tutorial.created_at
          };
        });

        setTutorials(processedTutorials);
      } catch (err) {
        console.error('获取合约教学数据失败:', err);
        setError(err.message);
        
        // 加载失败时使用默认数据
        setTutorials([
          {
            id: 1,
            title: 'Solidity 基础语法',
            level: '入门',
            description: '学习 Solidity 编程语言的基本语法和数据类型...',
            content: '内容加载失败，请稍后再试。'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorials();
  }, []);

  const [expandedTutorial, setExpandedTutorial] = useState(null);

  const handleTutorialClick = (tutorial) => {
    if (expandedTutorial?.id === tutorial.id) {
      setExpandedTutorial(null);
    } else {
      setExpandedTutorial(tutorial);
    }
  };

  return (
    <SimpleBar className="component-container tutorial-scroll">
      {verificationLoading || userTypeLoading ? (
        <div className="loading-container">
          <p>验证用户状态中...</p>
        </div>
      ) : !isVerified ? (
        <div className="verification-required">
          <h2>需要账号验证</h2>
          <p>请先完成账号验证（绑定UID）后后再访问此页面</p>
        </div>
      ) : userType !== '高级用户' && userType !== '合作机构' && userType !== 'premium' ? (
        <div className="verification-required">
          <h2>需要高级用户权限</h2>
          <p>此功能仅对高级用户开放，请升级您的账户等级</p>
          <p className="debug-info">当前用户类型: {userType}</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <p>正在加载教程内容...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>加载失败: {error}</p>
        </div>
      ) : (
        <div className="tutorial-container">
          {tutorials.map(tutorial => (
            <div key={tutorial.id} className="guide-item-wrapper">
              <div 
                className={`guide-item ${expandedTutorial?.id === tutorial.id ? 'active' : ''}`}
                onClick={() => handleTutorialClick(tutorial)}
              >
                <div className="guide-header">
                  <h3>{tutorial.title}</h3>
                  <span className={`level-badge ${tutorial.level}`}>{tutorial.level}</span>
                </div>
              </div>
              
              {expandedTutorial?.id === tutorial.id && (
                <div className="guide-detail-expanded">
                  <div className="tutorial-info">
                    <span className="level">等级：{tutorial.level}</span>
                  </div>
                  
                  <div className="guide-content">
                    
                    
                    <div className="tutorial-detailed-content markdown-content">
                      {/* 使用ReactMarkdown渲染Markdown内容 */}
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {tutorial.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SimpleBar>
  );
}

export default ContractTutorial; 