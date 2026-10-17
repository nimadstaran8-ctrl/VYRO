import { describe, it, expect, beforeEach } from 'vitest';
import { useStyleFinderStore } from '../../features/style-finder/store/styleFinderStore';
import type { Style, Color } from '../../types';
import type { Budget, Occasion, ShoppingFor } from '../../features/style-finder/types';

describe('Style Finder Store', () => {
  beforeEach(() => {
    const store = useStyleFinderStore.getState();
    store.reset();
  });

  describe('initial state', () => {
    it('starts at step 0', () => {
      const { step } = useStyleFinderStore.getState();
      expect(step).toBe(0);
    });

    it('has empty answers initially', () => {
      const { answers } = useStyleFinderStore.getState();
      expect(answers.style).toBeUndefined();
      expect(answers.shoppingFor).toBeUndefined();
      expect(answers.colors).toEqual([]);
      expect(answers.budget).toBeUndefined();
      expect(answers.occasion).toBeUndefined();
    });
  });

  describe('setStyle', () => {
    it('sets the style answer', () => {
      const { setStyle } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      expect(useStyleFinderStore.getState().answers.style).toBe('Street');
    });
  });

  describe('setShoppingFor', () => {
    it('sets the shopping for answer', () => {
      const { setShoppingFor } = useStyleFinderStore.getState();
      setShoppingFor('hat' as ShoppingFor);
      expect(useStyleFinderStore.getState().answers.shoppingFor).toBe('hat');
    });
  });

  describe('toggleColor', () => {
    it('adds a color to the answers', () => {
      const { toggleColor } = useStyleFinderStore.getState();
      toggleColor('Black' as Color);
      expect(useStyleFinderStore.getState().answers.colors).toContain('Black');
    });

    it('removes a color if already selected', () => {
      const { toggleColor } = useStyleFinderStore.getState();
      toggleColor('Black' as Color);
      toggleColor('Black' as Color);
      expect(useStyleFinderStore.getState().answers.colors).not.toContain('Black');
    });
  });

  describe('setBudget', () => {
    it('sets the budget answer', () => {
      const { setBudget } = useStyleFinderStore.getState();
      setBudget('under-30' as Budget);
      expect(useStyleFinderStore.getState().answers.budget).toBe('under-30');
    });
  });

  describe('setOccasion', () => {
    it('sets the occasion answer', () => {
      const { setOccasion } = useStyleFinderStore.getState();
      setOccasion('outdoor' as Occasion);
      expect(useStyleFinderStore.getState().answers.occasion).toBe('outdoor');
    });
  });

  describe('navigation', () => {
    it('increments step on nextStep', () => {
      const { nextStep, setStyle } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      nextStep();
      expect(useStyleFinderStore.getState().step).toBe(1);
    });

    it('decrements step on prevStep', () => {
      const { nextStep, prevStep, setStyle } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      nextStep();
      prevStep();
      expect(useStyleFinderStore.getState().step).toBe(0);
    });

    it('does not go below step 0', () => {
      const { prevStep } = useStyleFinderStore.getState();
      prevStep();
      expect(useStyleFinderStore.getState().step).toBe(0);
    });

    it('supports jumping to a specific step', () => {
      const { goToStep } = useStyleFinderStore.getState();
      goToStep(3);
      expect(useStyleFinderStore.getState().step).toBe(3);
    });
  });

  describe('findMatches', () => {
    it('generates scored recommendations after completing the quiz', () => {
      const { setStyle, setShoppingFor, toggleColor, setBudget, findMatches } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      setShoppingFor('hat' as ShoppingFor);
      toggleColor('Black' as Color);
      setBudget('under-30' as Budget);
      const result = findMatches();
      const { results } = useStyleFinderStore.getState();
      expect(results.length).toBeGreaterThan(0);
      expect(result.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('productId');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('reasons');
    });

    it('generates outfit sets when shopping for both', () => {
      const { setStyle, setShoppingFor, toggleColor, setBudget, findMatches } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      setShoppingFor('both' as ShoppingFor);
      toggleColor('Black' as Color);
      setBudget('100-plus' as Budget);
      findMatches();
      const { outfits } = useStyleFinderStore.getState();
      expect(outfits.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('resets the quiz to initial state', () => {
      const { setStyle, setShoppingFor, toggleColor, setBudget, setOccasion, nextStep, reset } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      setShoppingFor('hat' as ShoppingFor);
      toggleColor('Black' as Color);
      setBudget('under-30' as Budget);
      setOccasion('outdoor' as Occasion);
      nextStep();
      reset();
      const { answers, step, results, outfits } = useStyleFinderStore.getState();
      expect(step).toBe(0);
      expect(answers.style).toBeUndefined();
      expect(answers.colors).toEqual([]);
      expect(answers.occasion).toBeUndefined();
      expect(results).toEqual([]);
      expect(outfits).toEqual([]);
    });
  });
});
