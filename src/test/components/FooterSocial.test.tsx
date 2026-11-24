import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer';
import { AdminFooterSocial } from '../../pages/admin/AdminFooterSocial';
import { useLanguageStore } from '../../stores/languageStore';

const SETTINGS_STORAGE_KEY = 'vyro_settings';

describe('Footer Social Links', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders anchor elements with default social URLs', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        social: {
          instagram: 'https://www.instagram.com/nima_mk7338/',
          tiktok: 'https://www.tiktok.com/@nima53102',
          telegram: 'https://t.me/FreakConfig',
        },
      })
    );

    const html = renderToString(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(html).toContain('href="https://www.instagram.com/nima_mk7338/"');
    expect(html).toContain('href="https://www.tiktok.com/@nima53102"');
    expect(html).toContain('href="https://t.me/FreakConfig"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders updated social URLs after admin save', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        social: {
          instagram: 'https://www.instagram.com/updated/',
          tiktok: 'https://www.tiktok.com/@updated',
          telegram: 'https://t.me/updated',
        },
      })
    );

    const html = renderToString(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(html).toContain('href="https://www.instagram.com/updated/"');
    expect(html).toContain('href="https://www.tiktok.com/@updated"');
    expect(html).toContain('href="https://t.me/updated"');
  });

  it('does not render clickable anchors for invalid or missing URLs', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        social: {
          instagram: '',
          tiktok: 'not-a-url',
          telegram: 'ftp://invalid-protocol',
        },
      })
    );

    const html = renderToString(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(html).not.toContain('href=""');
    expect(html).not.toContain('href="not-a-url"');
    expect(html).not.toContain('href="ftp://invalid-protocol"');
  });

  it('preserves accessible labels on social links', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        social: {
          instagram: 'https://www.instagram.com/nima_mk7338/',
          tiktok: 'https://www.tiktok.com/@nima53102',
          telegram: 'https://t.me/FreakConfig',
        },
      })
    );

    const html = renderToString(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(html).toContain('aria-label="Instagram"');
    expect(html).toContain('aria-label="TikTok"');
    expect(html).toContain('aria-label="Telegram"');
  });

  it('renders the Persian creator credit and leaves an invalid phone icon inactive', () => {
    const previousLanguage = useLanguageStore.getState().language;
    try {
      useLanguageStore.setState({ language: 'fa' });
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ social: { phone: '123;ext=77' } }));
      const html = renderToString(<MemoryRouter><Footer /></MemoryRouter>);
      expect(html).toContain('سازنده: نیمادستاران');
      expect(html).toContain('aria-label="تماس تلفنی"');
      expect(html).not.toContain('href="tel:');
    } finally {
      useLanguageStore.setState({ language: previousLanguage });
    }
  });

  it('saves, changes, clears and resets the phone from the admin form', async () => {
    const previousLanguage = useLanguageStore.getState().language;
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.useFakeTimers();

    const findButton = (text: string) =>
      [...container.querySelectorAll('button')].find(button => button.textContent?.trim() === text)!;
    const renderFooter = () => renderToString(<MemoryRouter><Footer /></MemoryRouter>);

    try {
      useLanguageStore.setState({ language: 'en' });
      await act(async () => root.render(<AdminFooterSocial />));
      const input = container.querySelector<HTMLInputElement>('input[type="tel"]')!;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      const enterPhone = (value: string) => act(async () => {
        setValue.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      const save = () => act(async () => findButton('Save Changes').click());

      expect(findButton('Save Changes').disabled).toBe(true);
      expect(renderFooter()).not.toContain('href="tel:');

      await enterPhone('not a number');
      await save();
      expect(container.textContent).toContain('Please enter a valid phone number');
      expect(renderFooter()).not.toContain('href="tel:');

      await enterPhone('+۹۸ (۹۱۲) ۰۰۰-۰۰۰۰');
      await save();
      const firstFooter = renderFooter();
      expect(firstFooter).toContain('href="tel:+989120000000"');
      expect(firstFooter.indexOf('aria-label="Telegram"')).toBeLessThan(firstFooter.indexOf('href="tel:'));
      expect(findButton('Save Changes').disabled).toBe(true);

      await enterPhone('021 0000 0000');
      await save();
      expect(renderFooter()).toContain('href="tel:02100000000"');
      expect(renderFooter()).not.toContain('href="tel:+989120000000"');

      await enterPhone('');
      await save();
      expect(renderFooter()).not.toContain('href="tel:');

      await enterPhone('021 0000 0000');
      await save();
      await act(async () => findButton('Reset to Defaults').click());
      await act(async () => findButton('Reset').click());
      expect(input.value).toBe('');
      expect(renderFooter()).not.toContain('href="tel:');
      expect(renderFooter()).toContain('href="https://t.me/FreakConfig"');
      await act(async () => root.render(<MemoryRouter><Footer /></MemoryRouter>));
      expect(container.textContent).toContain('Creator: Nima Dastaran');
    } finally {
      await act(async () => root.unmount());
      container.remove();
      vi.useRealTimers();
      vi.unstubAllGlobals();
      useLanguageStore.setState({ language: previousLanguage });
    }
  });
});
