import Swal from 'sweetalert2';

const isWechat = /MicroMessenger/i.test(navigator.userAgent);

export function isWechatBrowser() {
  return isWechat;
}

export function handleWechatLinkClick(e) {
  if (!isWechat) return;

  const anchor = e.target.closest('a');
  if (!anchor || !anchor.href) return;

  const url = anchor.href;
  if (url.startsWith(window.location.origin) || url.startsWith('#')) return;

  e.preventDefault();
  e.stopPropagation();

  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }

  Swal.fire({
    title: '请在浏览器中打开',
    html: '<div style="word-break:break-all;color:rgba(255,255,255,0.7);font-size:0.85rem;line-height:1.6">'
      + '<p>链接已复制到剪贴板</p>'
      + '<p style="margin-top:0.8rem;padding:0.6rem;background:rgba(255,255,255,0.05);border-radius:6px;color:#ffd700;font-size:0.8rem">'
      + url + '</p>'
      + '<p style="margin-top:0.8rem;color:rgba(255,255,255,0.4);font-size:0.75rem">点击右上角 ··· 选择「在浏览器中打开」</p>'
      + '</div>',
    confirmButtonText: '知道了',
    confirmButtonColor: '#bfa14a',
    background: '#1e222d',
    color: '#d1d4dc',
  });
}
