import { fireEvent, render } from '@testing-library/react';
import HomePage from './HomePage';
import { LanguageProvider } from '../i18n/context';

jest.mock('particles.js', () => ({}));
jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => new Promise(() => {}),
        }),
      }),
    }),
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    window.particlesJS = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    localStorage.clear();
  });

  test('clicking the wechat icon does not crash', () => {
    const { container } = render(
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    );

    const wechatIcon = container.querySelector('.hp-social-icon.wechat');

    expect(wechatIcon).not.toBeNull();

    expect(() => fireEvent.click(wechatIcon)).not.toThrow();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('admiraltyz');
  });
});
