import { describe, expect, it } from 'vitest';
import { tryFormatNginx } from './nginxFormat';

describe('tryFormatNginx', () => {
  it('formats a compact nginx config', async () => {
    const source = 'server { listen 80; location / { proxy_pass http://app; } }';
    const formatted = await tryFormatNginx(source);

    expect(formatted).toContain('server {');
    expect(formatted).toContain('  listen 80;');
    expect(formatted).toContain('  location / {');
    expect(formatted).toContain('    proxy_pass http://app;');
  });
});
