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

  async function renderPublishedFooter(footer: object) {
    const container = document.createElement('div');
    const root = createRoot(container);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(footer)));
    try {
      await act(async () => root.render(<MemoryRouter><Footer /></MemoryRouter>));
      return container.innerHTML;
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  }

  it('renders accessible links for the default social URLs', async () => {
    const html = await renderPublishedFooter({});
    expect(html).toContain('href="https://www.instagram.com/nima_mk7338/"');
    expect(html).toContain('href="https://www.tiktok.com/@nima53102"');
    expect(html).toContain('href="https://t.me/FreakConfig"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Instagram"');
    expect(html).toContain('aria-label="TikTok"');
    expect(html).toContain('aria-label="Telegram"');
  });

  it('uses published social URLs instead of settings stored in this browser', async () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ social: {
      instagram: 'https://www.instagram.com/old/',
      phone: '02100000000',
    } }));
    const html = await renderPublishedFooter({
      instagram: 'https://www.instagram.com/updated/',
      tiktok: 'https://www.tiktok.com/@updated',
      telegram: '',
    });
    expect(html).toContain('href="https://www.instagram.com/updated/"');
    expect(html).toContain('href="https://www.tiktok.com/@updated"');
    expect(html).not.toContain('href="https://www.instagram.com/old/"');
    expect(html).not.toContain('href="https://t.me/FreakConfig"');
    expect(html).not.toContain('href="tel:');
  });

  it('leaves missing or invalid links inactive', async () => {
    const html = await renderPublishedFooter({ instagram: '', tiktok: 'not-a-url', telegram: 'ftp://invalid-protocol' });
    expect(html).not.toContain('href=""');
    expect(html).not.toContain('href="not-a-url"');
    expect(html).not.toContain('href="ftp://invalid-protocol"');
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

  it('publishes footer links, changes the phone and clears it through the server', async () => {
    const previousLanguage = useLanguageStore.getState().language;
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    let published: { phone?: string; telegram?: string } = {};
    const fetchPhone = vi.fn(async (_url: string, options: RequestInit) => {
      if (options.method === 'PUT') {
        if (new Headers(options.headers).get('Authorization') !== `Basic ${btoa('owner:correct')}`) {
          return new Response(null, { status: 401 });
        }
        published = JSON.parse(String(options.body));
      }
      return Response.json(published);
    });
    vi.stubGlobal('fetch', fetchPhone);

    const findButton = (text: string) =>
      [...container.querySelectorAll('button')].find(button => button.textContent?.trim() === text)!;
    const footerContainer = document.createElement('div');
    const footerRoot = createRoot(footerContainer);
    const renderFooter = async () => {
      await act(async () => footerRoot.render(<MemoryRouter key={JSON.stringify(published)}><Footer /></MemoryRouter>));
      return footerContainer.innerHTML;
    };

    try {
      useLanguageStore.setState({ language: 'en' });
      await act(async () => root.render(<AdminFooterSocial />));
      const input = container.querySelector<HTMLInputElement>('input[type="tel"]')!;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      const password = container.querySelector<HTMLInputElement>('input[type="password"]')!;
      const enter = (field: HTMLInputElement, value: string) => act(async () => {
        setValue.call(field, value);
        field.dispatchEvent(new Event('input', { bubbles: true }));
      });
      const save = () => act(async () => findButton('Save Changes').click());

      expect(findButton('Save Changes').disabled).toBe(true);
      expect(await renderFooter()).not.toContain('href="tel:');

      await enter(input, 'not a number');
      await enter(password, 'correct');
      await save();
      expect(container.textContent).toContain('Enter a valid phone number');

      await enter(input, '+۹۸ (۹۱۲) ۰۰۰-۰۰۰۰');
      await enter(password, 'wrong');
      await save();
      expect(container.textContent).toContain('The owner password is incorrect');
      expect(await renderFooter()).not.toContain('href="tel:');

      await enter(password, 'correct');
      await enter(container.querySelector<HTMLInputElement>('input[aria-label=Telegram]')!, 'https://t.me/updated');
      await save();
      const firstFooter = await renderFooter();
      expect(firstFooter).toContain('href="tel:+989120000000"');
      expect(firstFooter).toContain('href="https://t.me/updated"');
      expect(firstFooter.indexOf('aria-label="Telegram"')).toBeLessThan(firstFooter.indexOf('href="tel:'));
      expect(findButton('Save Changes').disabled).toBe(true);

      await enter(input, '021 0000 0000');
      await enter(password, 'correct');
      await save();
      expect(await renderFooter()).toContain('href="tel:02100000000"');

      await enter(input, '');
      await enter(password, 'correct');
      await save();
      expect(await renderFooter()).not.toContain('href="tel:');
    } finally {
      await act(async () => root.unmount());
      await act(async () => footerRoot.unmount());
      container.remove();
      vi.unstubAllGlobals();
      useLanguageStore.setState({ language: previousLanguage });
    }
  });
});
