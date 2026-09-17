import { describe, it, expect, beforeEach } from 'vitest';
import { useStyleFinderStore } from '../../features/style-finder/store/styleFinderStore';
import type { Style, Color } from '../../types';
import type { Budget, ShoppingFor } from '../../features/style-finder/store/styleFinderStore';

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
  });

  describe('findMatches', () => {
    it('generates recommendations after completing the quiz', () => {
      const { setStyle, setShoppingFor, toggleColor, setBudget, findMatches } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      setShoppingFor('hat' as ShoppingFor);
      toggleColor('Black' as Color);
      setBudget('under-30' as Budget);
      const resultIds = findMatches();
      const { results } = useStyleFinderStore.getState();
      expect(results.length).toBeGreaterThan(0);
      expect(resultIds.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('resets the quiz to initial state', () => {
      const { setStyle, setShoppingFor, toggleColor, setBudget, nextStep, reset } = useStyleFinderStore.getState();
      setStyle('Street' as Style);
      setShoppingFor('hat' as ShoppingFor);
      toggleColor('Black' as Color);
      setBudget('under-30' as Budget);
      nextStep();
      reset();
      const { answers, step, results } = useStyleFinderStore.getState();
      expect(step).toBe(0);
      expect(answers.style).toBeUndefined();
      expect(answers.colors).toEqual([]);
      expect(results).toEqual([]);
    });
  });
});
