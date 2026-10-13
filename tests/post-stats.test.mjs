import assert from "node:assert/strict";
import test from "node:test";

import { discussionCounts, postViews } from "../src/lib/post-stats.ts";

function browser(t, hostname = "hj0543.github.io", blockedStorage = false) {
  const storage = new Map();
  for (const [name, value] of Object.entries({
    window: { location: { hostname } },
    sessionStorage: {
      getItem: (key) => {
        if (blockedStorage) throw new Error("Storage blocked");
        return storage.get(key) ?? null;
      },
      setItem: (key, value) => {
        if (blockedStorage) throw new Error("Storage blocked");
        storage.set(key, value);
      },
    },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else delete globalThis[name];
    });
  }
}

test("likes count only HEART, and comments include replies", () => {
  assert.deepEqual(discussionCounts({
    totalCommentCount: 3,
    totalReplyCount: 4,
    reactions: { HEART: { count: 2 }, THUMBS_UP: { count: 9 } },
  }), { comments: 7, likes: 2 });
});

test("malformed counts never masquerade as valid zeroes", () => {
  for (const value of [-1, 0.5, "4", NaN, Infinity]) {
    assert.throws(() => discussionCounts({
      totalCommentCount: value, totalReplyCount: 0, reactions: {},
    }));
  }
});

test("a new post without a view counter reads as zero", async (t) => {
  browser(t);
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.match(url, /\/get\//);
    return new Response("{}", { status: 404 });
  });
  assert.equal(await postViews("test-new-counter"), 0);
});

test("concurrent renders record one visit; later reads do not increment", async (t) => {
  browser(t);
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    requests.push(url);
    return Response.json({ value: 12 });
  });
  assert.deepEqual(await Promise.all([
    postViews("test-once", true), postViews("test-once", true), postViews("test-once"),
  ]), [12, 12, 12]);
  await postViews("test-once", true);
  assert.equal(requests.length, 2);
  assert.match(requests[0], /\/hit\//);
  assert.match(requests[1], /\/get\//);
});

test("local previews never add production views", async (t) => {
  browser(t, "localhost");
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.match(url, /\/get\//);
    return Response.json({ value: 7 });
  });
  assert.equal(await postViews("test-local", true), 7);
});

test("blocked session storage still prevents duplicate visits", async (t) => {
  browser(t, "hj0543.github.io", true);
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    requests.push(url);
    return Response.json({ value: 1 });
  });
  await postViews("test-blocked-storage", true);
  await postViews("test-blocked-storage", true);
  assert.match(requests[0], /\/hit\//);
  assert.match(requests[1], /\/get\//);
});

test("a failed increment can be retried on the next visit", async (t) => {
  browser(t);
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.match(url, /\/hit\//);
    return ++requests === 1 ? new Response("{}", { status: 503 }) : Response.json({ value: 1 });
  });
  await assert.rejects(postViews("test-retry", true));
  assert.equal(await postViews("test-retry", true), 1);
});

test("API errors remain unknown instead of showing a false zero", async (t) => {
  browser(t);
  t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 503 }));
  await assert.rejects(postViews("test-unavailable"));
});
