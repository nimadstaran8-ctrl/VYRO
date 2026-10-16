import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer';

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
});
