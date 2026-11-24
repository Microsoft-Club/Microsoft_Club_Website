// The admin UI reads its role from the stored token; expired or unknown roles must not unlock tabs.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { getAdminRole, getAllowedTabs, TOKEN_KEY, ROLE_TABS } = await import('../frontend/src/utils/auth.ts');

const tokenWith = (payload) => `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.y`;
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

beforeEach(() => store.clear());

test('no token means no role and no tabs', () => {
  assert.equal(getAdminRole(), null);
  assert.deepEqual(getAllowedTabs(null), []);
});

test('a valid, unexpired token returns its role and that role\'s tabs', () => {
  localStorage.setItem(TOKEN_KEY, tokenWith({ role: 'Marketing', exp: inOneHour() }));
  assert.equal(getAdminRole(), 'Marketing');
  assert.deepEqual(getAllowedTabs('Marketing'), ROLE_TABS.Marketing);
});

test('expired tokens, unknown roles and garbage tokens are rejected', () => {
  localStorage.setItem(TOKEN_KEY, tokenWith({ role: 'General', exp: 1 }));
  assert.equal(getAdminRole(), null);
  localStorage.setItem(TOKEN_KEY, tokenWith({ role: 'Superuser', exp: inOneHour() }));
  assert.equal(getAdminRole(), null);
  localStorage.setItem(TOKEN_KEY, 'not-a-jwt');
  assert.equal(getAdminRole(), null);
});

test('only General can open every dashboard tab', () => {
  const allTabs = ['waitingList', 'events', 'podcasts', 'members', 'projects', 'blogs'];
  assert.deepEqual([...ROLE_TABS.General].sort(), [...allTabs].sort());
  for (const role of ['Logikal', 'Marketing', 'Inductions', 'Dev']) {
    assert.ok(ROLE_TABS[role].length < allTabs.length, `${role} should be limited`);
  }
});
