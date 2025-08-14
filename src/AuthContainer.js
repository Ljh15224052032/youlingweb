import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import useUserStore from './store/userStore';
import './Login.css';

function AuthContainer() {
  const [page, setPage] = useState('login'); // login/register/forgot
  const { login } = useUserStore();

  useEffect(() => {
    // 只初始化一次粒子特效
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
    script.async = true;
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: '#bfa14a' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 120, color: '#bfa14a', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'repulse' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            },
            modes: {
              repulse: { distance: 80, duration: 0.4 },
              push: { particles_nb: 4 }
            }
          },
          retina_detect: true
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      const el = document.getElementById('particles-js');
      if (el) el.innerHTML = '';
    };
  }, []);

  let content = null;
  if (page === 'login') {
    content = <Login onLogin={login} onSwitch={setPage} />;
  } else if (page === 'register') {
    content = <Register onBack={() => setPage('login')} />;
  } else if (page === 'forgot') {
    content = <ForgotPassword onBack={() => setPage('login')} />;
  }

  return (
    <div className="login-bg">
      <div id="particles-js"></div>
      {content}
    </div>
  );
}

export default AuthContainer; 