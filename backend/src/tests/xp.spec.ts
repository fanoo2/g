import { describe, it, expect } from 'vitest';
import { calcXpGain, calcLevel } from '../xp.js';

describe('XP System', () => {
  it('gives 1 xp per token', () => {
    expect(calcXpGain(42)).toBe(42);
  });
  it('levels every 500 xp', () => {
    expect(calcLevel(0)).toBe(1);
    expect(calcLevel(499)).toBe(1);
    expect(calcLevel(500)).toBe(2);
  });
});
