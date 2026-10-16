import { describe, it, expect, beforeEach, vi } from 'vitest';

const SETTINGS_STORAGE_KEY = 'vyro_settings';

describe('Settings Service - Social Links', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getSocialSettings', () => {
    it('returns default social URLs when localStorage is empty', async () => {
      const service = await import('../../services/settings/settingsService');
      const social = service.getSocialSettings();

      expect(social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');
    });

    it('returns saved social URLs from localStorage', async () => {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          social: {
            instagram: 'https://www.instagram.com/test/',
            tiktok: 'https://www.tiktok.com/@test',
            telegram: 'https://t.me/test',
          },
        })
      );

      const service = await import('../../services/settings/settingsService');
      const social = service.getSocialSettings();

      expect(social.instagram).toBe('https://www.instagram.com/test/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@test');
      expect(social.telegram).toBe('https://t.me/test');
    });

    it('falls back to defaults when stored settings are corrupted', async () => {
      localStorage.setItem(SETTINGS_STORAGE_KEY, 'not-json{{');

      const service = await import('../../services/settings/settingsService');
      const social = service.getSocialSettings();

      expect(social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');
    });

    it('falls back to defaults for missing social keys', async () => {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          store: { storeName: 'Test Store' },
        })
      );

      const service = await import('../../services/settings/settingsService');
      const social = service.getSocialSettings();

      expect(social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');
    });
  });

  describe('updateSocialSettings', () => {
    it('persists valid social URLs and reads them back', async () => {
      const service = await import('../../services/settings/settingsService');

      const result = service.updateSocialSettings({
        instagram: 'https://www.instagram.com/nima_mk7338/',
        tiktok: 'https://www.tiktok.com/@nima53102',
        telegram: 'https://t.me/FreakConfig',
      });

      expect(result.success).toBe(true);

      const social = service.getSocialSettings();
      expect(social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');

      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = JSON.parse(raw!);
      expect(parsed.social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(parsed.social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(parsed.social.telegram).toBe('https://t.me/FreakConfig');
    });

    it('updates only the provided social URL without affecting others', async () => {
      const service = await import('../../services/settings/settingsService');

      service.updateSocialSettings({ instagram: 'https://www.instagram.com/updated/' });

      const social = service.getSocialSettings();
      expect(social.instagram).toBe('https://www.instagram.com/updated/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');
    });

    it('reports failure when localStorage cannot be written', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const service = await import('../../services/settings/settingsService');
      const result = service.updateSocialSettings({
        instagram: 'https://www.instagram.com/nima_mk7338/',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      setItemSpy.mockRestore();
    });
  });

  describe('resetSocialSettings', () => {
    it('restores default social URLs after they were changed', async () => {
      const service = await import('../../services/settings/settingsService');

      service.updateSocialSettings({
        instagram: 'https://www.instagram.com/changed/',
        tiktok: 'https://www.tiktok.com/@changed',
        telegram: 'https://t.me/changed',
      });

      const resetResult = service.resetSocialSettings();
      expect(resetResult.success).toBe(true);

      const social = service.getSocialSettings();
      expect(social.instagram).toBe('https://www.instagram.com/nima_mk7338/');
      expect(social.tiktok).toBe('https://www.tiktok.com/@nima53102');
      expect(social.telegram).toBe('https://t.me/FreakConfig');
    });
  });
});
