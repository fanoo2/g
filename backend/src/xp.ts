export function calcXpGain(tokens: number) { return tokens; }
export function calcLevel(xp: number) { return Math.max(1, Math.floor(xp / 500) + 1); }
