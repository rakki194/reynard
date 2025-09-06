import { describe, it, expect } from 'vitest';
import * as all from '.';

describe('connection index barrel', () => {
  it('exports expected symbols', () => {
    expect(all).toBeTruthy();
    const keys = Object.keys(all);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys).toContain('ConnectionManager');
  });
});
