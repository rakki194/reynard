import { describe, it, expect } from 'vitest';
import { ConnectionConfigManager } from './config';
import { ConnectionType, SecurityLevel } from './types';

describe('ConnectionConfigManager', () => {
  it('creates default config and allows get/set', () => {
    const m = new ConnectionConfigManager();
    const d = m.get('whatever');
    expect(d.name).toBe('whatever');
    expect(d.connectionType).toBe(ConnectionType.HTTP);
    expect(typeof d.timeout).toBe('number');
    expect([true, false]).toContain(Boolean(d.compression));
    expect(Object.values(SecurityLevel)).toContain(d.securityLevel!);
    const custom = { ...d, name: 'custom', url: 'http://x' };
    m.set('custom', custom);
    expect(m.get('custom')).toEqual(custom);
  });
});
