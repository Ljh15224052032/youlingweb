import React, { useState } from 'react';
import './Login.css';
import bcrypt from 'bcryptjs';
import supabase from './services/supabaseClient';

function Login({ onLogin, onSwitch }) {
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('请填写所有信息');
      return;
    }
    if (email && !validateEmail(email)) {
      alert('邮箱格式不正确');
      return;
    }

    try {
      setSubmitting(true);

      // 从 Supabase 查询用户
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password_hash, nickname, points, invite_code, parent_invite_code, binance_uid, bg_uid, created_at')
        .eq('username', email)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!user) {
        alert('用户不存在');
        return;
      }

      // 验证密码
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        alert('密码错误');
        return;
      }

      // 登录成功，传递用户数据给 store
      onLogin({
        username: email, // 传递邮箱作为 username，让 login 方法去查询 Supabase
        email: email,
      });

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('登录失败:', err);
      alert(`登录失败：${err?.message || '请稍后重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="glass-card">
        <h2 className="login-title">游领资本</h2>
        <input
          type="text"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <div className="input-error-text">{emailError}</div>}
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={submitting}>{submitting ? '登录中...' : '登录'}</button>
        <div className="login-actions">
          <button type="button" className="action-btn" style={{width:'20%', background:'none',boxShadow:'none'}} onClick={() => onSwitch('register')}>注册</button>
          <button type="button" className="action-btn" style={{width:'20%', background:'none',boxShadow:'none'}} onClick={() => onSwitch('forgot')}>忘记密码</button>
        </div>
      </div>
    </form>
  );
}

export default Login; 