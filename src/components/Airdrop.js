import React, { useState, useEffect } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Swal from 'sweetalert2';
import useUserStore from '../store/userStore';
import { marked } from 'marked';

function Airdrop({ setCurrentSection }) {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [userTypeLoading, setUserTypeLoading] = useState(true);
  
  // 从userStore获取用户信息
  const { userInfo } = useUserStore();
  // 判断用户是否登录（通过检查用户ID是否存在）
  const isLoggedIn = !!userInfo.id;
  const user = isLoggedIn ? { id: userInfo.id } : null;

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

  // 从Supabase获取空投活动数据
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

  // 确保在选中活动后保持引用
  useEffect(() => {
    if (selectedAirdrop) {
      console.log('活动已选中，ID:', selectedAirdrop.id);
    }
  }, [selectedAirdrop]);

  // 按状态优先级排序：即将开始 > 进行中 > 已结束
  const sortedAirdrops = [...airdrops].sort((a, b) => {
    const statusOrder = { 'upcoming': 0, 'ongoing': 1, 'ended': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleParticipate = (airdrop) => {
    // 先设置选中的活动，确保在整个流程中活动ID都可用
    // 创建一个新对象，避免引用问题
    const airdropData = {...airdrop};
    setSelectedAirdrop(airdropData);
    console.log('选中活动:', airdropData.id, airdropData);
    
    // 改为使用弹窗显示活动详情
    Swal.fire({
      title: `${airdrop.name} - 活动详情`,
      width: '70%',
      html: `
        <div class="airdrop-popup-content">
          <div class="activity-content markdown-content">
            ${airdrop.content ? 
              `<div id="markdown-content-container"></div>` :
              `<div class="no-content-message">暂无详细活动内容</div>`
            }
          </div>
          
          <div class="info-box" style="margin-top: 20px; padding: 15px; border: 1px solid #333; border-radius: 8px; background-color: #1a1a1a;">
            <h4 style="color: #ffd700; margin-bottom: 10px;">⚠️ 活动信息</h4>
            <p style="margin: 5px 0;">• 奖励: ${airdrop.reward}</p>
            <p style="margin: 5px 0;">• 开始时间: ${airdrop.startDate}</p>
            <p style="margin: 5px 0;">• 结束时间: ${airdrop.deadline}</p>
            <p style="margin: 5px 0;">• 状态: ${getStatusText(airdrop.status)}</p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: airdrop.status === 'ongoing',
      cancelButtonText: '关闭',
      confirmButtonText: airdrop.status === 'ongoing' ? '立即参与' : '关闭',
      didOpen: () => {
        // 如果有内容，渲染Markdown内容
        if (airdrop.content) {
          const container = document.getElementById('markdown-content-container');
          
          // 使用marked库将Markdown转换为HTML
          try {
            // 配置marked选项，支持GFM和表格等
            marked.setOptions({
              breaks: true,        // 支持GitHub风格的换行
              gfm: true,           // 支持GitHub风格的Markdown
              headerIds: true,     // 为标题生成ID
              mangle: false,       // 不转义HTML
              sanitize: false      // 不进行HTML清理（允许HTML标签）
            });
            
            // 将Markdown转换为HTML并插入容器
            container.innerHTML = marked.parse(airdrop.content);
            
            // 添加样式到容器内的图片 - 缩小并居中
            const images = container.querySelectorAll('img');
            images.forEach(img => {
              img.style.maxWidth = '30%'; // 进一步缩小图片到50%
              img.style.height = 'auto';
              img.style.marginBottom = '15px';
              img.style.marginTop = '10px';
              img.style.borderRadius = '6px';
              // 居中显示图片
              img.style.display = 'block';
              img.style.marginLeft = 'auto';
              img.style.marginRight = 'auto';
              // 添加边框和阴影效果
              img.style.border = '1px solid #333';
              img.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            });
          } catch (error) {
            console.error('渲染Markdown内容失败', error);
            container.textContent = airdrop.content;
          }
        }
      },
      backdrop: true,
      customClass: {
        container: 'airdrop-popup-container',
        popup: 'airdrop-popup',
        content: 'airdrop-popup-inner'
      },
    }).then((result) => {
      // 如果点击"立即参与"按钮
      if (result.isConfirmed && airdrop.status === 'ongoing') {
        // 在点击参与按钮时再次确认选中的活动
        // 创建一个新的对象副本避免引用丢失
        const airdropCopy = {...airdrop};
        setSelectedAirdrop(airdropCopy);
        console.log('准备参与活动，已设置活动ID:', airdropCopy.id, airdropCopy);
        
        // 直接传递活动数据，避免状态更新延迟问题
        handleJoinActivity(airdropCopy);
      }
    });
  };
  
  // 处理用户参与活动
  const handleJoinActivity = async (airdropData = null) => {
    // 检查用户ID是否存在
    if (!userInfo.id) {
      Swal.fire({
        title: '需要登录',
        text: '请先登录后再参与活动',
        icon: 'warning',
        confirmButtonText: '确定',
        background: '#1e222d',
        color: '#d1d4dc',
      });
      return;
    }
    
    // 只检查用户是否已验证
    if (!isVerified) {
      Swal.fire({
        title: '需要验证',
        text: '请先完成账号验证后再参与活动',
        icon: 'warning',
        confirmButtonText: '确定',
        background: '#1e222d',
        color: '#d1d4dc',
      });
      return;
    }
    
    // 优先使用传入的活动数据，如果没有则使用状态中的活动
    const currentAirdrop = airdropData || selectedAirdrop;
    
    // 检查是否有选中的活动
    if (!currentAirdrop || !currentAirdrop.id) {
      console.error('没有选中的活动或活动ID丢失', { airdropData, selectedAirdrop, currentAirdrop });
      Swal.fire({
        title: '操作失败',
        text: '没有选中的活动，请重新选择活动',
        icon: 'error',
        confirmButtonText: '确定',
        background: '#1e222d',
        color: '#d1d4dc',
      });
      return;
    }
    
    console.log('准备提交活动:', currentAirdrop);
    
    // 用户已验证，显示提交表单
    const { value: formValues } = await     Swal.fire({
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
      background: '#1e222d',
      color: '#d1d4dc',
      confirmButtonColor: '#bfa14a',
      cancelButtonColor: '#666',
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
    
    if (formValues && currentAirdrop && currentAirdrop.id) {
      console.log('表单提交中，活动ID:', currentAirdrop.id);
      await submitActivity(formValues.text, formValues.file, currentAirdrop);
    } else {
      console.error('提交失败：表单值或活动数据缺失', { formValues, currentAirdrop });
    }
  };
  
  // 提交活动参与信息到Supabase
  const submitActivity = async (text, file, airdropData) => {
    // 使用传入的活动数据，不再依赖state
    const activityData = airdropData || selectedAirdrop;
    
    // 打印调试信息以检查状态
    console.log('提交活动信息 - 选中的活动:', activityData);
    console.log('提交活动信息 - 用户ID:', userInfo.id);
    
    if (!activityData || !activityData.id || !userInfo.id) {
      console.error('提交失败: 没有活动或用户未登录');
      Swal.fire({
        icon: 'error',
        title: '提交失败',
        text: '没有选中活动或用户未登录，请重新尝试',
        background: '#1e222d',
        color: '#d1d4dc',
        confirmButtonColor: '#ef5350',
        confirmButtonText: '确定'
      });
      return;
    }
    
    try {
      // 从userStore获取用户ID (现在数据库user_id是INT8类型)
      const userId = userInfo.id;
      if (!userId) {
        throw new Error('无法获取有效的用户ID');
      }
      
      console.log('提交活动使用的用户ID:', userId);
      setSubmissionLoading(true);
      
      // 1. 上传图片到Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
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
            user_id: userId,
            airdrop_id: activityData.id,
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
        { airdrop_id: activityData.id }
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
      
      // 显示更详细的错误信息
      let errorMessage = '提交过程中发生错误，请稍后重试';
      
      if (error.message) {
        errorMessage += `\n错误详情: ${error.message}`;
      }
      
      if (error.details) {
        errorMessage += `\n${error.details}`;
      }
      
      Swal.fire({
        title: '提交失败',
        text: errorMessage,
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

  // 添加自定义样式，用于弹窗内容
  useEffect(() => {
    // 向文档添加样式，确保弹窗内的Markdown内容正确显示
    const style = document.createElement('style');
    style.textContent = `
      .airdrop-popup {
        background-color: #1a1a1a !important;
        color: #eee !important;
        border-radius: 10px !important;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5) !important;
      }
      
      .airdrop-popup-content {
        padding: 10px;
        max-height: 70vh;
        overflow-y: auto;
        text-align: left; /* 确保文本左对齐 */
      }
      
      .airdrop-popup-content h1, 
      .airdrop-popup-content h2, 
      .airdrop-popup-content h3 {
        color: #ffd700;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        text-align: left; /* 标题左对齐 */
      }
      
      .airdrop-popup-content p {
        text-align: left; /* 段落左对齐 */
        margin-bottom: 1rem;
      }
      
      .airdrop-popup-content img {
        max-width: 30% !important; /* 减小图片宽度至50% */
        height: auto !important;
        display: block !important;
        margin: 15px auto !important; /* 上下间距15px，左右自动（居中） */
        border-radius: 6px !important;
        border: 1px solid #333 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
      }
      
      .airdrop-popup-content code {
        background-color: #2a2a2e;
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }
      
      .airdrop-popup-content blockquote {
        border-left: 3px solid #ffd700;
        margin-left: 0;
        padding-left: 10px;
        color: #bbb;
        text-align: left;
      }
      
      .airdrop-popup-content a {
        color: #00ff88;
      }
      
      .airdrop-popup-content ul,
      .airdrop-popup-content ol {
        text-align: left;
        padding-left: 20px;
        margin-bottom: 1rem;
      }
    `;
    document.head.appendChild(style);
    
    // 清理函数
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      ) : (
        <div className="airdrop-layout">
          <SimpleBar style={{height: 'calc(100vh - 100px)'}} className="airdrop-list">
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
        </div>
      )}
    </div>
  );
}

export default Airdrop; 