import React from 'react';
import { useLang } from '../i18n/context';
import './LangToggle.css';

function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {lang === 'zh' ? 'C' : 'N'}
    </button>
  );
}

export default LangToggle;
