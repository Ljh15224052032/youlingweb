import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'strong', 'em', 'code', 'pre',
  'ul', 'ol', 'li', 'blockquote', 'hr', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'img', 'br', 'span', 'div', 'del', 'sup', 'sub',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'];

export function safeMarkdown(content) {
  if (!content) return '';
  const html = marked.parse(content, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
