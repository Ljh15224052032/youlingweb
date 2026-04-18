import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import bcrypt from 'bcryptjs';
import { supabase } from './services/supabaseClient';
import Swal from 'sweetalert2';
import { useLang } from './i18n/context';

function Register() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError(t('register.validEmail'));
    } else {
      setEmailError('');
    }
  };

  const generateInviteCode = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      Swal.fire({ title: t('register.fillAll'), icon: 'warning', confirmButtonText: t('register.confirm') });
      return;
    }
    if (email && !validateEmail(email)) {
      Swal.fire({ title: t('register.invalidEmail'), icon: 'warning', confirmButtonText: t('register.confirm') });
      return;
    }
    if (password.length < 8) {
      Swal.fire({ title: t('register.passwordTooShort'), icon: 'warning', confirmButtonText: t('register.confirm') });
      return;
    }
    if (password !== confirm) {
      Swal.fire({ title: t('register.passwordMismatch'), icon: 'warning', confirmButtonText: t('register.confirm') });
      return;
    }

    try {
      setSubmitting(true);

      const { data: existedUsers, error: existErr } = await supabase
        .from('users')
        .select('id')
        .eq('username', email)
        .limit(1);

      if (existErr) throw existErr;
      if (Array.isArray(existedUsers) && existedUsers.length > 0) {
        Swal.fire({
          icon: 'warning', title: t('register.emailExists'),
          background: '#1e222d', color: '#d1d4dc',
          confirmButtonColor: '#bfa14a', confirmButtonText: t('register.confirm'),
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newInviteCode = generateInviteCode(6);

      const { error: insertErr } = await supabase
        .from('users')
        .insert([{
          username: email,
          password_hash: passwordHash,
          invite_code: newInviteCode,
          parent_invite_code: inviteCode || null,
          nickname: username || null,
        }]);

      if (insertErr) throw insertErr;

      Swal.fire({
        icon: 'success', title: t('register.success'),
        text: t('register.successMsg'),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#bfa14a', confirmButtonText: t('register.goToLogin'),
      }).then(() => navigate('/login'));
    } catch (err) {
      console.error('注册失败：', err);
      Swal.fire({
        icon: 'error', title: t('register.failed'),
        text: err?.message || t('register.retryLater'),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: t('register.confirm'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form">
      <div className="ghost-logo">GHOST <svg width="36" height="36" viewBox="0 0 220 220" fill="none" style={{verticalAlign:'middle'}}><path fillRule="evenodd" clipRule="evenodd" d="M75 109.5L13 19H71L108.5 73.5L146 19H197L134 109.5V187H169.5L202.5 166.5V206.5H75V109.5ZM101.5 82.5L90.5 99.5V194.5L81 199.5L79.5 99.5L31 28.5H66.5L101.5 82.5Z" fill="url(#yl-grad)"/><defs><linearGradient id="yl-grad" x1="202" y1="206" x2="108" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#FFC107"/></linearGradient></defs></svg></div>
      <form className="glass-card" onSubmit={handleSubmit}>
        <h2 className="login-title">{t('register.title')}</h2>
        <input type="text" placeholder={t('register.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} onBlur={handleEmailBlur} className={emailError ? 'input-error' : ''} />
        {emailError && <div className="input-error-text">{emailError}</div>}
        <input type="password" placeholder={t('register.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
        <input type="password" placeholder={t('register.confirmPasswordPlaceholder')} value={confirm} onChange={e => setConfirm(e.target.value)} />
        <input type="text" placeholder={t('register.inviteCodePlaceholder')} value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
        <button type="submit" disabled={submitting}>{submitting ? t('register.submitting') : t('register.submit')}</button>
        <div className="login-actions">
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/login')}>{t('register.backToLogin')}</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
