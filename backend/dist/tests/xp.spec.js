import { describe, it, expect } from 'vitest';
// Minimal duplication of XP logic (could export from app.ts via a util module)
function calcXpGain(tokens) { return tokens; }
function calcLevel(xp) { return Math.max(1, Math.floor(xp / 500) + 1); }
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
