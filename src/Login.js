import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import bcrypt from 'bcryptjs';
import { supabase } from './services/supabaseClient';
import useUserStore from './store/userStore';
import { useLang } from './i18n/context';

function Login() {
  const navigate = useNavigate();
  const { t } = useLang();
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
      setEmailError(t('login.validEmail'));
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert(t('login.fillAll'));
      return;
    }
    if (email && !validateEmail(email)) {
      alert(t('login.invalidEmail'));
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
        alert(t('login.userNotFound'));
        return;
      }

      if (!user.password_hash || typeof user.password_hash !== 'string') {
        alert(t('login.accountError'));
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        alert(t('login.wrongPassword'));
        return;
      }

      await fetchUserByUsername(email);
      navigate('/dashboard');

    } catch (err) {
      console.error('登录失败:', err);
      alert(t('login.loginFailed') + '：' + (err?.message || t('login.retryLater')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form">
      <div className="ghost-logo">GHOST <svg width="36" height="36" viewBox="0 0 220 220" fill="none" style={{verticalAlign:'middle'}}><path fillRule="evenodd" clipRule="evenodd" d="M75 109.5L13 19H71L108.5 73.5L146 19H197L134 109.5V187H169.5L202.5 166.5V206.5H75V109.5ZM101.5 82.5L90.5 99.5V194.5L81 199.5L79.5 99.5L31 28.5H66.5L101.5 82.5Z" fill="url(#yl-grad)"/><defs><linearGradient id="yl-grad" x1="202" y1="206" x2="108" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#FFC107"/></linearGradient></defs></svg></div>
      <form className="glass-card" onSubmit={handleSubmit}>
        <h2 className="login-title">{t('login.title')}</h2>
        <input
          type="text"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <div className="input-error-text">{emailError}</div>}
        <input
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={submitting}>{submitting ? t('login.submitting') : t('login.submit')}</button>
        <div className="login-actions">
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/register')}>{t('login.register')}</button>
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/forgot')}>{t('login.forgotPassword')}</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
