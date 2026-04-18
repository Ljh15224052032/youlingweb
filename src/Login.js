import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import bcrypt from 'bcryptjs';
import { supabase } from './services/supabaseClient';
import useUserStore from './store/userStore';

function Login() {
  const navigate = useNavigate();
  const fetchUserByUsername = useUserStore(state => state.fetchUserByUsername);
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password_hash, nickname, points, invite_code, parent_invite_code, binance_uid, bg_uid, created_at')
        .eq('username', email)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        alert('用户不存在');
        return;
      }

      if (!user.password_hash || typeof user.password_hash !== 'string') {
        alert('账号数据异常，请联系管理员');
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        alert('密码错误');
        return;
      }

      await fetchUserByUsername(email);
      navigate('/dashboard');

    } catch (err) {
      console.error('登录失败:', err);
      alert(`登录失败：${err?.message || '请稍后重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form">
      <div className="ghost-logo">GHOST <svg width="36" height="36" viewBox="0 0 220 220" fill="none" style={{verticalAlign:'middle'}}><path fillRule="evenodd" clipRule="evenodd" d="M75 109.5L13 19H71L108.5 73.5L146 19H197L134 109.5V187H169.5L202.5 166.5V206.5H75V109.5ZM101.5 82.5L90.5 99.5V194.5L81 199.5L79.5 99.5L31 28.5H66.5L101.5 82.5Z" fill="url(#yl-grad)"/><defs><linearGradient id="yl-grad" x1="202" y1="206" x2="108" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#FFC107"/></linearGradient></defs></svg></div>
      <form className="glass-card" onSubmit={handleSubmit}>
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
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/register')}>注册</button>
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/forgot')}>忘记密码</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
