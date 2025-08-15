import React, { useState } from 'react';
import './Login.css';
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [verify, setVerify] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [serverCode, setServerCode] = useState(''); // mock

  // 校验邮箱格式
  const validateEmail = (value) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
    } else {
      setEmailError('');
    }
  };

  // 模拟发送验证码
  const handleSendCode = () => {
    if (!email) {
      setEmailError('请输入邮箱');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }
    setEmailError('');
    const mockCode = '123456';
    setServerCode(mockCode);
    setSent(true);
    alert('验证码已发送到邮箱（模拟: 123456）');
  };

  // 验证验证码
  const handleVerifyCode = () => {
    if (code === serverCode) {
      setVerify(true);
    } else {
      alert('验证码错误');
    }
  };

  // 重置密码
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || !confirm) {
      alert('请填写新密码');
      return;
    }
    if (newPassword !== confirm) {
      alert('两次密码不一致');
      return;
    }
    alert('密码重置成功！');
    onBack();
  };

  return (
      <div className="login-form">
        <div className="ghost-logo">GHOST</div>
        <form className="glass-card" onSubmit={verify ? handleSubmit : e => e.preventDefault()}>
          <h2 className="login-title">重置密码</h2>
          <input
            type="text"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={sent}
            onBlur={handleEmailBlur}
            className={emailError ? 'input-error' : ''}
          />
          {emailError && <div className="input-error-text">{emailError}</div>}
          {!sent && (
            <button type="button" style={{
              width:'100%',
              marginBottom:'1rem',
              padding: '0.9rem 0',
              background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)',
              color: '#18181a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }} onClick={handleSendCode}>发送验证码</button>
          )}
          {sent && !verify && (
            <>
              <input type="text" placeholder="输入验证码" value={code} onChange={e => setCode(e.target.value)} />
              <button type="button" style={{
                width:'100%',
                marginBottom:'1rem',
                padding: '0.9rem 0',
                background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)',
                color: '#18181a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }} onClick={handleVerifyCode}>验证验证码</button>
            </>
          )}
          {verify && (
            <>
              <input type="password" placeholder="新密码" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <input type="password" placeholder="确认新密码" value={confirm} onChange={e => setConfirm(e.target.value)} />
              <button type="submit" style={{
                width:'100%',
                padding: '0.9rem 0',
                background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)',
                color: '#18181a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}>提交</button>
            </>
          )}
          <div className="login-actions" style={{width:'20%',display:'flex',justifyContent:'left',alignItems:'center'}}>
            <button type="button" className="action-btn" onClick={onBack} style={{width:'100%',background:'none',boxShadow:'none'}}>返回登录</button>
          </div>
        </form>
      </div>
  );
}

export default ForgotPassword; 