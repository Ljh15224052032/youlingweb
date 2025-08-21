import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Swal from 'sweetalert2';

function Airdrop() {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);
  const [user, setUser] = useState(null);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // 从Supabase获取空投活动数据
  // 获取当前用户信息及验证状态
  useEffect(() => {
    const getUserData = async () => {
      try {
        // 获取当前会话用户
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // 获取用户验证状态
          const { data, error } = await supabase
            .from('users')
            .select('is_verified')
            .eq('id', session.user.id)
            .single();
          
          if (!error && data) {
            setIsUserVerified(data.is_verified);
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    
    getUserData();
    
    // 监听用户认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // 获取用户验证状态
        const { data } = await supabase
          .from('users')
          .select('is_verified')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setIsUserVerified(data.is_verified);
        }
      } else {
        setUser(null);
        setIsUserVerified(false);
      }
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const { data, error } = await supabase
          .from('airdrops')
          .select('*');
        
        if (error) throw error;
        
        // 将后端数据映射到前端使用的格式
        const formattedAirdrops = data.map(airdrop => ({
          id: airdrop.id,
          name: airdrop.name,
          description: '点击查看活动详情', // 不再显示content作为描述
          reward: airdrop.reward ? `${airdrop.reward}积分` : '暂无奖励',
          deadline: airdrop.end_time,
          status: airdrop.status, // 直接使用后端的status
          startDate: airdrop.start_time,
          content: airdrop.content // 保存完整的活动内容
        }));
        
        setAirdrops(formattedAirdrops);
      } catch (error) {
        console.error('获取空投活动失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAirdrops();
  }, []);

  // 按状态优先级排序：即将开始 > 进行中 > 已结束
  const sortedAirdrops = [...airdrops].sort((a, b) => {
    const statusOrder = { 'upcoming': 0, 'ongoing': 1, 'ended': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleParticipate = (airdrop) => {
    setSelectedAirdrop(airdrop);
  };

  const closeTutorial = () => {
    setSelectedAirdrop(null);
  };
  
  // 处理用户参与活动
  const handleJoinActivity = async () => {
    // 再次获取最新的会话状态
    const { data: { session } } = await supabase.auth.getSession();
    console.log('当前会话状态:', session);
    console.log('当前用户状态:', user);
    
    // 优先使用最新获取的会话用户
    const currentUser = session?.user || user;
    
    if (!currentUser) {
      Swal.fire({
        title: '需要登录',
        text: '请先登录后再参与活动',
        icon: 'warning',
        confirmButtonText: '确定'
      });
      return;
    }
    
    // 更新本地用户状态（以防之前没有正确设置）
    if (session?.user && !user) {
      setUser(session.user);
    }
    
    if (!isUserVerified) {
      Swal.fire({
        title: '未通过验证',
        text: '请先完成交易所UID认证后再参与活动',
        icon: 'warning',
        confirmButtonText: '前往验证',
        showCancelButton: true,
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          // 跳转至验证页面的逻辑，可以根据实际路由修改
          window.location.href = '/verification';
        }
      });
      return;
    }
    
    // 用户已验证，显示提交表单
    const { value: formValues } = await Swal.fire({
      title: '参与活动',
      html:
        '<div class="submission-form">' +
        '<label for="submission-text">描述信息</label>' +
        '<textarea id="submission-text" class="swal2-textarea" placeholder="请输入活动参与描述..."></textarea>' +
        '<label for="submission-file">上传截图</label>' +
        '<input id="submission-file" type="file" accept="image/*" class="swal2-file">' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '提交',
      preConfirm: () => {
        const submissionText = document.getElementById('submission-text').value;
        const submissionFile = document.getElementById('submission-file').files[0];
        
        if (!submissionText) {
          Swal.showValidationMessage('请输入描述信息');
          return false;
        }
        
        if (!submissionFile) {
          Swal.showValidationMessage('请上传截图');
          return false;
        }
        
        return {
          text: submissionText,
          file: submissionFile
        };
      }
    });
    
    if (formValues) {
      await submitActivity(formValues.text, formValues.file);
    }
  };
  
  // 提交活动参与信息到Supabase
  const submitActivity = async (text, file) => {
    // 再次获取最新的会话状态，确保有用户信息
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user || user;
    
    if (!selectedAirdrop || !currentUser) {
      console.error('提交失败: 没有活动或用户信息');
      return;
    }
    
    try {
      setSubmissionLoading(true);
      
      // 1. 上传图片到Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
      const filePath = `activity_submissions/${fileName}`;
      
      // 上传图片
      const { error: uploadError } = await supabase.storage
        .from('activity_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 获取图片URL
      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(filePath);
      
      // 2. 将记录插入到activity_submissions表
      const { error: submitError } = await supabase
        .from('activity_submissions')
        .insert([
          {
            user_id: currentUser.id,
            airdrop_id: selectedAirdrop.id,
            submission_text: text,
            submission_image: publicUrl,
            status: 'pending',  // 待审核状态
            created_at: new Date()
          }
        ]);
        
      if (submitError) throw submitError;
      
      // 3. 更新Airdrops表中的participants数量
      const { error: updateError } = await supabase.rpc(
        'increment_participants', 
        { airdrop_id: selectedAirdrop.id }
      );
      
      if (updateError) console.error('更新参与人数失败:', updateError);
      
      // 提交成功
      Swal.fire({
        title: '提交成功',
        text: '您的活动参与申请已提交，请等待审核',
        icon: 'success',
        confirmButtonText: '确定'
      });
      
    } catch (error) {
      console.error('提交活动参与失败:', error);
      Swal.fire({
        title: '提交失败',
        text: '提交过程中发生错误，请稍后重试',
        icon: 'error',
        confirmButtonText: '确定'
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中'; // 注意这里更改为与后端匹配的 ongoing
      case 'ended': return '已结束';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return '#ffd700';
      case 'ongoing': return '#00ff88'; // 注意这里更改为与后端匹配的 ongoing
      case 'ended': return '#ff6b6b';
      default: return '#999';
    }
  };

  return (
    <div className="component-container">
      <div className="airdrop-layout">
        <SimpleBar style={{height: 'calc(100vh - 200px)'}} className="airdrop-list">
          <h2 className="section-title">空投活动</h2>
          {loading ? (
            <div className="loading-container">
              <p>加载中...</p>
            </div>
          ) : (
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
                  {/* 将所有按钮改为显示活动内容，不再区分状态 */}
                  <button 
                    className="participate-btn"
                    onClick={() => handleParticipate(airdrop)}
                  >
                    查看活动详情
                  </button>
                </div>
              ))}
            </div>
          )}
        </SimpleBar>

        {selectedAirdrop && (
          <div className="tutorial-panel">
            <div className="tutorial-header">
              <h3>{selectedAirdrop.name} - 活动详情</h3>
              <button className="close-btn" onClick={closeTutorial}>×</button>
            </div>
            <SimpleBar style={{height: 'calc(100vh - 200px)'}} className="tutorial-content tutorial-scroll">
              {selectedAirdrop.content ? (
                <div className="activity-content markdown-content">
                  {/* 使用 ReactMarkdown 渲染 Markdown 内容 */}
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]} // 允许Markdown中包含HTML
                  >
                    {selectedAirdrop.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="no-content-message">
                  <p>暂无详细活动内容</p>
                </div>
              )}
              
              <div className="tutorial-section">
                <h4 className="tutorial-subtitle">⚠️ 活动信息</h4>
                <div className="info-box">
                  <p>• 奖励: {selectedAirdrop.reward}</p>
                  <p>• 开始时间: {selectedAirdrop.startDate}</p>
                  <p>• 结束时间: {selectedAirdrop.deadline}</p>
                  <p>• 状态: {getStatusText(selectedAirdrop.status)}</p>
                </div>
              </div>

              {selectedAirdrop.status === 'ongoing' && (
                <button 
                  className="start-task-btn"
                  onClick={handleJoinActivity}
                  disabled={submissionLoading}
                >
                  {submissionLoading ? '提交中...' : '立即参与'}
                </button>
              )}
            </SimpleBar>
          </div>
        )}
      </div>
    </div>
  );
}

export default Airdrop;