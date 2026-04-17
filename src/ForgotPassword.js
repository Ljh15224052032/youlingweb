import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { supabase } from './services/supabaseClient';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

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

  const handleCheckEmail = async () => {
    if (!email) {
      setEmailError('请输入邮箱');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', email)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setEmailError('该邮箱未注册');
        return;
      }

      setEmailChecked(true);
      setEmailError('');
    } catch (err) {
      Swal.fire({
        icon: 'error', title: '查询失败',
        text: err?.message || '请稍后重试',
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: '确定',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      Swal.fire({
        icon: 'warning', title: '密码要求',
        text: '新密码至少需要 8 位',
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#bfa14a', confirmButtonText: '确定',
      });
      return;
    }
    if (newPassword !== confirm) {
      Swal.fire({
        icon: 'warning', title: '密码不一致',
        text: '两次输入的密码不相同',
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#bfa14a', confirmButtonText: '确定',
      });
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
        icon: 'success', title: '重置成功',
        text: '密码已更新，请使用新密码登录',
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#bfa14a', confirmButtonText: '去登录',
      }).then(() => navigate('/login'));
    } catch (err) {
      Swal.fire({
        icon: 'error', title: '重置失败',
        text: err?.message || '请稍后重试',
        background: '#1e222d', color: '#d1d4dc',
        confirmButtonColor: '#ef5350', confirmButtonText: '确定',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form">
      <div className="ghost-logo">GHOST</div>
      <form className="glass-card" onSubmit={emailChecked ? handleSubmit : e => e.preventDefault()}>
        <h2 className="login-title">重置密码</h2>

        <input
          type="text"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={emailChecked}
          onBlur={handleEmailBlur}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <div className="input-error-text">{emailError}</div>}

        {!emailChecked ? (
          <button type="button" style={{
            width: '100%', marginBottom: '1rem', padding: '0.9rem 0',
            background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)',
            color: '#18181a', border: 'none', borderRadius: '8px',
            fontWeight: '700', cursor: 'pointer',
          }} onClick={handleCheckEmail}>下一步</button>
        ) : (
          <>
            <input type="password" placeholder="新密码（至少 8 位）" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type="password" placeholder="确认新密码" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '0.9rem 0',
              background: 'linear-gradient(90deg, #bfa14a 60%, #ffd700 100%)',
              color: '#18181a', border: 'none', borderRadius: '8px',
              fontWeight: '700', cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>{submitting ? '提交中...' : '重置密码'}</button>
          </>
        )}

        <div className="login-actions" style={{ width: '20%', display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
          <button type="button" className="action-btn" onClick={() => navigate('/login')} style={{ width: '100%', background: 'none', boxShadow: 'none' }}>返回登录</button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
