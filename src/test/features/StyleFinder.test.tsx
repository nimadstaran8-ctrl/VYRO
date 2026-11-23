import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { StyleFinder } from '../../features/style-finder/components/StyleFinder';
import { useStyleFinderStore } from '../../features/style-finder/store/styleFinderStore';
import { useLanguageStore } from '../../stores/languageStore';
import { getUsdToTomanRate, setUsdToTomanRate } from '../../services/currency';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) =>
      createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const SETTINGS_STORAGE_KEY = 'vyro_settings';
const LANGUAGE_STORAGE_KEY = 'vyro_language';

describe('StyleFinder component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    useStyleFinderStore.getState().reset();

    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ state: { language: 'en' }, version: 0 })
    );
    useLanguageStore.setState({ language: 'en' });

    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        aiStylist: {
          enabled: true,
          enabledStyles: ['Street', 'Minimal', 'Classic', 'Sport', 'Luxury', 'Casual'],
        },
      })
    );
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  });

  it('advances to the next step when a single-choice option is clicked', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(createElement(StyleFinder));
    });

    expect(container.textContent).toContain('What is your preferred style?');

    const streetwearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Streetwear'
    );
    expect(streetwearButton).toBeDefined();

    await act(async () => {
      streetwearButton!.click();
    });

    expect(container.textContent).toContain('What are you looking for?');
  });

  it('keeps the selected answer when navigating backward', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(createElement(StyleFinder));
    });

    const streetwearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Streetwear'
    );

    await act(async () => {
      streetwearButton!.click();
    });

    const backButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Back')
    );
    expect(backButton).toBeDefined();

    await act(async () => {
      backButton!.click();
    });

    expect(container.textContent).toContain('What is your preferred style?');

    const selectedButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-pressed') === 'true'
    );
    expect(selectedButton?.textContent).toBe('Streetwear');
  });

  it('updates the Persian rial budget options when the store rate changes', async () => {
    const originalRate = getUsdToTomanRate();
    try {
      await act(async () => {
        useLanguageStore.setState({ language: 'fa' });
        useStyleFinderStore.getState().goToStep(4);
        setUsdToTomanRate(200_000);
        root = createRoot(container);
        root.render(createElement(StyleFinder));
      });
      expect(container.textContent).toContain('۶۰٬۰۰۰٬۰۰۰ ریال');

      await act(async () => setUsdToTomanRate(230_000));
      expect(container.textContent).toContain('۶۹٬۰۰۰٬۰۰۰ ریال');
      expect(container.textContent).not.toContain('دلار');
    } finally {
      await act(async () => setUsdToTomanRate(originalRate));
    }
  });

  it('allows multiple selections on the colors step without advancing', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(createElement(StyleFinder));
    });

    const streetwearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Streetwear'
    );
    await act(async () => {
      streetwearButton!.click();
    });

    const bothButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Both'
    );
    await act(async () => {
      bothButton!.click();
    });

    expect(container.textContent).toContain('Preferred colors');

    const blackButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Black'
    );
    const whiteButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'White'
    );
    expect(blackButton).toBeDefined();
    expect(whiteButton).toBeDefined();

    await act(async () => {
      blackButton!.click();
    });

    await act(async () => {
      whiteButton!.click();
    });

    expect(container.textContent).toContain('Preferred colors');

    const selectedButtons = Array.from(container.querySelectorAll('button')).filter(
      (button) => button.getAttribute('aria-pressed') === 'true'
    );
    const selectedLabels = selectedButtons.map((button) => button.textContent);
    expect(selectedLabels).toContain('Black');
    expect(selectedLabels).toContain('White');
  });
});
