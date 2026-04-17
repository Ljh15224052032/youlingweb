import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import './Login.css';

function AuthContainer({ page }) {
  const navigate = useNavigate();

  useEffect(() => {
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
    content = <Login />;
  } else if (page === 'register') {
    content = <Register />;
  } else if (page === 'forgot') {
    content = <ForgotPassword />;
  }

  return (
    <div className="login-bg">
      <div id="particles-js"></div>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 200,
          background: 'rgba(24,24,26,0.8)',
          border: '1px solid #bfa14a',
          color: '#ffd700',
          padding: '8px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        ← 返回首页
      </button>
      {content}
    </div>
  );
}

export default AuthContainer;
