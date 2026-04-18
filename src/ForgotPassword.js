import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { supabase } from './services/supabaseClient';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';
import { useLang } from './i18n/context';

function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const validateEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError(t('forgot.validEmail'));
    } else {
      setEmailError('');
    }
  };

  const handleCheckEmail = async () => {
    if (!email) { setEmailError(t('forgot.enterEmail')); return; }
    if (!validateEmail(email)) { setEmailError(t('forgot.validEmail')); return; }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', email)
        .maybeSingle();

      if (error) throw error;
      if (!data) { setEmailError(t('forgot.emailNotRegistered')); return; }

      setEmailChecked(true);
      setEmailError('');
    } catch (err) {
      Swal.fire({
        icon: 'error', title: t('forgot.queryFailed'),
        text: err?.message || t('forgot.retryLater'),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: t('forgot.confirm'),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      Swal.fire({ icon: 'warning', title: t('forgot.passwordRequirement'), text: t('forgot.passwordTooShort'), background: '#1e222d', color: '#d1d4dc', confirmButtonColor: '#bfa14a', confirmButtonText: t('forgot.confirm') });
      return;
    }
    if (newPassword !== confirm) {
      Swal.fire({ icon: 'warning', title: t('forgot.passwordMismatch'), text: t('forgot.passwordMismatchMsg'), background: '#1e222d', color: '#d1d4dc', confirmButtonColor: '#bfa14a', confirmButtonText: t('forgot.confirm') });
      return;
    }

    try {
      setSubmitting(true);
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', email);

      if (error) throw error;

      Swal.fire({
        icon: 'success', title: t('forgot.success'),
        text: t('forgot.successMsg'),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#bfa14a', confirmButtonText: t('forgot.goToLogin'),
      }).then(() => navigate('/login'));
    } catch (err) {
      Swal.fire({
        icon: 'error', title: t('forgot.failed'),
        text: err?.message || t('forgot.retryLater'),
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: t('forgot.confirm'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form">
      <div className="ghost-logo">GHOST <svg width="36" height="36" viewBox="0 0 220 220" fill="none" style={{verticalAlign:'middle'}}><path fillRule="evenodd" clipRule="evenodd" d="M75 109.5L13 19H71L108.5 73.5L146 19H197L134 109.5V187H169.5L202.5 166.5V206.5H75V109.5ZM101.5 82.5L90.5 99.5V194.5L81 199.5L79.5 99.5L31 28.5H66.5L101.5 82.5Z" fill="url(#yl-grad)"/><defs><linearGradient id="yl-grad" x1="202" y1="206" x2="108" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#FFC107"/></linearGradient></defs></svg></div>
      <form className="glass-card" onSubmit={emailChecked ? handleSubmit : e => e.preventDefault()}>
        <h2 className="login-title">{t('forgot.title')}</h2>
        <input type="text" placeholder={t('forgot.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} disabled={emailChecked} onBlur={handleEmailBlur} className={emailError ? 'input-error' : ''} />
        {emailError && <div className="input-error-text">{emailError}</div>}

        {!emailChecked ? (
          <button type="button" style={{ width: '100%', marginBottom: '1rem', padding: '0.9rem 0', background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)', color: '#18181a', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} onClick={handleCheckEmail}>{t('forgot.nextStep')}</button>
        ) : (
          <>
            <input type="password" placeholder={t('forgot.newPasswordPlaceholder')} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type="password" placeholder={t('forgot.confirmPasswordPlaceholder')} value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.9rem 0', background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)', color: '#18181a', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.6 : 1 }}>{submitting ? t('forgot.submitting') : t('forgot.submit')}</button>
          </>
        )}

        <div className="login-actions">
          <button type="button" className="action-btn" style={{background:'none',boxShadow:'none',whiteSpace:'nowrap'}} onClick={() => navigate('/login')}>{t('forgot.backToLogin')}</button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
