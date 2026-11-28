import { SOCIAL_LINKS } from '../../constants/socialLinks';
import type { SocialSettings } from './settingsService';

const endpoint = '/api/storefront-footer';
export const defaultFooter: SocialSettings = { ...SOCIAL_LINKS, phone: '' };

export function readStorefrontFooter(signal?: AbortSignal): Promise<SocialSettings> {
  return requestFooter({ signal });
}

export async function saveStorefrontFooter(footer: SocialSettings, password: string): Promise<SocialSettings> {
  if (import.meta.env.PROD && location.protocol !== 'https:') throw new Error('unavailable');
  const credentials = new TextEncoder().encode(`owner:${password}`);
  return requestFooter({
    method: 'PUT',
    headers: {
      Authorization: `Basic ${btoa(String.fromCharCode(...credentials))}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(footer),
  });
}

async function requestFooter(options: RequestInit): Promise<SocialSettings> {
  const response = await fetch(endpoint, { ...options, cache: 'no-store' });
  if (response.status === 401) throw new Error('unauthorized');
  if (!response.ok) throw new Error('unavailable');
  const data: Partial<SocialSettings> = await response.json();
  return {
    instagram: typeof data.instagram === 'string' ? data.instagram : defaultFooter.instagram,
    tiktok: typeof data.tiktok === 'string' ? data.tiktok : defaultFooter.tiktok,
    telegram: typeof data.telegram === 'string' ? data.telegram : defaultFooter.telegram,
    phone: typeof data.phone === 'string' ? data.phone : defaultFooter.phone,
  };
}
