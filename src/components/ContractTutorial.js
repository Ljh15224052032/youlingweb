import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import useUserStore from '../store/userStore';
import { safeMarkdown } from '../utils/sanitize';
import { useLang } from '../i18n/context';

function ContractTutorial() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useUserStore();
  const isVerified = userInfo.is_verified;
  const userType = userInfo.user_type || '普通用户';
  const { t } = useLang();

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
            : t('contract.noDesc');

          return {
            id: tutorial.id,
            title: tutorial.title || t('contract.defaultTitle'),
            level: level,
            description: description,
            content: tutorial.content || t('contract.noContent'),
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
            title: t('contract.basicSyntax'),
            level: t('contract.beginner'),
            description: t('contract.basicSyntaxDesc'),
            content: t('contract.defaultContent')
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [t]);

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
      {!isVerified ? (
        <div className="verification-required">
          <h2>{t('contract.needVerifyTitle')}</h2>
          <p>{t('contract.needVerifyDesc')}</p>
        </div>
      ) : userType !== t('profile.advancedUser') && userType !== '合作机构' && userType !== 'premium' ? (
        <div className="verification-required">
          <h2>{t('contract.needPremiumTitle')}</h2>
          <p>{t('contract.needPremiumDesc')}</p>
          <p className="debug-info">{t('contract.currentUserType')}{userType}</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <p>{t('contract.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{t('contract.loadFailed')}{error}</p>
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
                    <span className="level">{t('contract.level')}{tutorial.level}</span>
                  </div>

                  <div className="guide-content">


                    <div className="tutorial-detailed-content markdown-content">
                      <div dangerouslySetInnerHTML={{ __html: safeMarkdown(tutorial.content) }} />
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
