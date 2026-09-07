import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAuditJson } from '../scripts/audit-fetch-json.mjs';

test('raw audit authenticates the exact GitHub API origin without allowing credential redirects', async () => {
  let options;
  const result = await fetchAuditJson('https://api.github.com/repos/example/public/commits/main', {
    token: 'test-only-token', fetchImpl: async (_url, init) => {
      options = init;
      return new Response(JSON.stringify({ sha: 'source-sha' }), { status: 200 });
    },
  });
  assert.equal(options.headers.Authorization, 'Bearer test-only-token');
  assert.equal(options.redirect, 'error');
  assert.deepEqual(result, { sha: 'source-sha' });
});

test('raw source, lookalike domains and unauthenticated local runs never receive an API credential', async () => {
  for (const url of ['https://raw.githubusercontent.com/example/public/main/data.json',
    'https://api.github.com.example.org/data', 'http://api.github.com/data']) {
    await fetchAuditJson(url, { token: 'test-only-token', fetchImpl: async (_url, init) => {
      assert.equal(init.headers.Authorization, undefined);
      return new Response('{}');
    } });
  }
  await fetchAuditJson('https://api.github.com/repos/example/public', {
    token: '', fetchImpl: async (_url, init) => {
      assert.equal(init.headers.Authorization, undefined);
      return new Response('{}');
    },
  });
});

test('audit HTTP failure remains a failure without exposing the credential or inventing source data', async () => {
  await assert.rejects(fetchAuditJson('https://api.github.com/repos/example/public', {
    token: 'test-only-token', fetchImpl: async () => new Response('{}', { status: 403 }),
  }), (error) => error.message.includes('Fetch failed 403') && !error.message.includes('test-only-token'));
});
