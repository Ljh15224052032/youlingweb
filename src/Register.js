import React, { useState } from 'react';
import './Login.css';
import bcrypt from 'bcryptjs';
import supabase from './services/supabaseClient';
import Swal from 'sweetalert2';
function Register({ onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
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
      Swal.fire({
        title: '请填写所有信息',
        icon: 'warning',
        confirmButtonText: '确定'
      });
      return;
    }
    if (email && !validateEmail(email)) {
      Swal.fire({
        title: '邮箱格式不正确',
        icon: 'warning',
        confirmButtonText: '确定'
      });
      return;
    }
    if (password.length < 8) {
      Swal.fire({
        title: '密码长度至少需要8位',
        icon: 'warning',
        confirmButtonText: '确定'
      });
      return;
    }
    if (password !== confirm) {
      Swal.fire({
        title: '两次密码不一致',
        icon: 'warning',
        confirmButtonText: '确定'
      });
      return;
    }

    try {
      setSubmitting(true);

      // 检查是否已存在相同用户名（这里用邮箱作为用户名）
      const { data: existedUsers, error: existErr } = await supabase
        .from('users')
        .select('id')
        .eq('username', email)
        .limit(1);

      if (existErr) {
        throw existErr;
      }
      if (Array.isArray(existedUsers) && existedUsers.length > 0) {
        alert('该邮箱已注册');
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newInviteCode = generateInviteCode(6);

      const payload = {
        username: email,
        password_hash: passwordHash,
        invite_code: newInviteCode,
        parent_invite_code: inviteCode || null,
        nickname: username || null,
      };

      const { error: insertErr } = await supabase
        .from('users')
        .insert([payload]);

      if (insertErr) {
        throw insertErr;
      }

      alert('注册成功！请使用邮箱和密码登录。');
      onBack();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('注册失败：', err);
      alert(`注册失败：${err?.message || '请稍后重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="glass-card">
          <h2 className="login-title">注册账号</h2>
          <input type="text" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} onBlur={handleEmailBlur} className={emailError ? 'input-error' : ''} />
          {emailError && <div className="input-error-text">{emailError}</div>}
          <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
          <input type="password" placeholder="确认密码" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <input type="text" placeholder="邀请码" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
          <button type="submit" disabled={submitting}>{submitting ? '提交中...' : '注册'}</button>
          <div className="login-actions" style={{width:'20%',display:'flex',justifyContent:'left',alignItems:'center'}}>
            <button type="button" className="action-btn" onClick={onBack} style={{width:'100%',background:'none',boxShadow:'none'}}>返回登录</button>
          </div>
        </div>
      </form>
  );
}

export default Register; 