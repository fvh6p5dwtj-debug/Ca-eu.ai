import { describe, it, expect } from 'vitest';
import { characters } from '../lib/characters';
import { STARTERS } from '../app/chat/[characterId]/ChatInterface';

// A character with no entry in STARTERS doesn't error — it silently falls back
// to a generic line, so the only symptom is a thin-looking sidebar. That is how
// 16 characters shipped without starters, and how `yuki2` lost its own when the
// duplicate `yuki` id was renamed. These tests make that failure loud.
describe('conversation starters', () => {
  it('has an entry for every character in the roster', () => {
    const missing = characters.filter((c) => !STARTERS[c.id]).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('has no entry for an id that is not in the roster', () => {
    const ids = new Set(characters.map((c) => c.id));
    const orphans = Object.keys(STARTERS).filter((k) => !ids.has(k));
    expect(orphans).toEqual([]);
  });

  it('gives every character exactly three non-empty starters', () => {
    for (const [id, list] of Object.entries(STARTERS)) {
      expect(list, `${id} starter count`).toHaveLength(3);
      for (const s of list) {
        expect(s.trim(), `${id} has an empty starter`).not.toBe('');
      }
    }
  });

  it('keeps the two Yukis distinct', () => {
    // Same persona space, so it is easy to let them converge by accident.
    expect(STARTERS.yuki).not.toEqual(STARTERS.yuki2);
  });
});
