import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ImageUpload } from '../../features/admin/components/ImageUpload';
import { imageStorage } from '../../features/admin/services/imageStorage';
import { t } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/languageStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it.each([true, false])('removes an image from the form (already saved: %s)', async (alreadySaved) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const image = { id: 'img_test', dataUrl: '/test.png', isPrimary: true };
  const onImagesChange = vi.fn();
  const deleteImage = vi.spyOn(imageStorage, 'delete').mockResolvedValue({ success: true });
  const { language } = useLanguageStore.getState();

  try {
    await act(async () => {
      root.render(
        <ImageUpload
          images={[image]}
          savedImageIds={alreadySaved ? [image.id] : []}
          onImagesChange={onImagesChange}
        />,
      );
    });

    const removeButton = Array.from(container.querySelectorAll('button')).find(
      button => button.getAttribute('aria-label') === t('admin.removeImage', language),
    );
    expect(removeButton).toBeDefined();
    await act(async () => removeButton!.click());

    const confirmButton = container.querySelector('[role="dialog"] button:last-child');
    expect(confirmButton).toBeInstanceOf(HTMLButtonElement);
    await act(async () => (confirmButton as HTMLButtonElement).click());

    expect(onImagesChange).toHaveBeenCalledWith([]);
    if (alreadySaved) {
      expect(deleteImage).not.toHaveBeenCalled();
    } else {
      expect(deleteImage).toHaveBeenCalledWith(image.id);
    }
  } finally {
    await act(async () => root.unmount());
    container.remove();
    deleteImage.mockRestore();
  }
});
