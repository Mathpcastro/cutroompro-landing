import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/download.js';

const release = 'https://github.com/Mathpcastro/cutroom/releases/download/v0.6.0';
const installers = {
  windows: `${release}/CutRoom.Setup.0.6.0.exe`,
  'macos-arm64': `${release}/CutRoom-0.6.0-mac-arm64.dmg`,
  'macos-x64': `${release}/CutRoom-0.6.0-mac-x64.dmg`,
};

function request(body, overrides = {}) {
  return {
    method: 'POST',
    headers: {
      origin: 'https://cutroom.test', host: 'cutroom.test',
      'x-forwarded-proto': 'https', 'content-type': 'application/json', ...overrides,
    },
    body,
  };
}

function response() {
  return {
    headers: {}, statusCode: 200, body: '',
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body; },
  };
}

async function withMockedBackend(run) {
  const originalToken = process.env.CUTROOM_SITES_BYPASS_TOKEN;
  const originalFetch = globalThis.fetch;
  process.env.CUTROOM_SITES_BYPASS_TOKEN = 'test-only-token';
  let fetchCalls = 0;
  globalThis.fetch = async (_url, options) => {
    fetchCalls++;
    assert.equal(options.headers['OAI-Sites-Authorization'], 'Bearer test-only-token');
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  };
  try { await run(() => fetchCalls); }
  finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.CUTROOM_SITES_BYPASS_TOKEN;
    else process.env.CUTROOM_SITES_BYPASS_TOKEN = originalToken;
  }
}

test('returns the selected official installer after backend persistence', async () => {
  await withMockedBackend(async getFetchCalls => {
    for (const [platform, downloadUrl] of Object.entries(installers)) {
      const res = response();
      await handler(request({ name: 'Teste', email: 'test@example.com', whatsapp: '+14155552671', platform }), res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.body), { ok: true, downloadUrl });
    }
    assert.equal(getFetchCalls(), Object.keys(installers).length);
  });
});

test('rejects an unlisted platform before contacting the backend', async () => {
  await withMockedBackend(async getFetchCalls => {
    const res = response();
    await handler(request({ platform: 'linux' }), res);
    assert.equal(res.statusCode, 422);
    assert.equal(JSON.parse(res.body).ok, false);
    assert.equal(getFetchCalls(), 0);
  });
});

test('rejects cross-site form submissions', async () => {
  await withMockedBackend(async getFetchCalls => {
    const res = response();
    await handler(request({ platform: 'windows' }, { 'sec-fetch-site': 'cross-site' }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(getFetchCalls(), 0);
  });
});

test('does not proxy a form when the backend token is missing', async () => {
  const originalToken = process.env.CUTROOM_SITES_BYPASS_TOKEN;
  const originalFetch = globalThis.fetch;
  delete process.env.CUTROOM_SITES_BYPASS_TOKEN;
  globalThis.fetch = async () => { throw new Error('must not call backend'); };
  try {
    const res = response();
    await handler(request({ platform: 'windows' }), res);
    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).ok, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.CUTROOM_SITES_BYPASS_TOKEN;
    else process.env.CUTROOM_SITES_BYPASS_TOKEN = originalToken;
  }
});
