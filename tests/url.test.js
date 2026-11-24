// safeExternalUrl guards every outside link (LinkedIn, socials, project repos) against javascript:/data: URLs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeExternalUrl } from '../frontend/src/utils/url.ts';

test('keeps http, https and mailto links', () => {
  assert.equal(safeExternalUrl('https://linkedin.com/in/someone'), 'https://linkedin.com/in/someone');
  assert.equal(safeExternalUrl('http://example.com/'), 'http://example.com/');
  assert.equal(safeExternalUrl('mailto:club@example.com'), 'mailto:club@example.com');
});

test('rejects script and data URLs', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), undefined);
  assert.equal(safeExternalUrl('  JavaScript:alert(1)'), undefined);
  assert.equal(safeExternalUrl('data:text/html,<script>alert(1)</script>'), undefined);
});

test('returns undefined for empty or malformed input', () => {
  assert.equal(safeExternalUrl(undefined), undefined);
  assert.equal(safeExternalUrl(null), undefined);
  assert.equal(safeExternalUrl(''), undefined);
  assert.equal(safeExternalUrl('not a url'), undefined);
});
