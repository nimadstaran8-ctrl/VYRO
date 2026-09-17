import { cn } from '../../lib/utils';
import type { Color } from '../../types';

interface ColorOptionsProps {
  colors: Color[];
  selected: Color | string;
  onChange: (color: Color | string) => void;
}

const colorMap: Record<Color, string> = {
  Black: '#111111',
  White: '#FFFFFF',
  Brown: '#8B5A2B',
  Beige: '#E8DCC4',
  Green: '#2D5A3D',
  Blue: '#2E5AAC',
  Gold: '#D4AF37',
};

export function ColorOptions({ colors, selected, onChange }: ColorOptionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selected === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'group relative flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all',
              isSelected
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-primary hover:border-primary'
            )}
            aria-pressed={isSelected}
          >
            <span
              className="h-4 w-4 rounded-full border border-black/10"
              style={{ backgroundColor: colorMap[color] || color.toLowerCase() }}
            />
            {color}
          </button>
        );
      })}
    </div>
  );
}
