import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

// Exercise the real listing implementation without a Next request or live
// Supabase writes. Only its imported infrastructure is replaced by test doubles.
const source = await readFile(
  new URL("../lib/data/items.js", import.meta.url),
  "utf8",
);
const isolatedSource = source
  .replace(/^import .*;\r?\n/gm, "")
  .replace(/^export /gm, "");

function setup(responses = {}) {
  const calls = [];
  const client = {
    from(view) {
      const call = { view, operations: [] };
      calls.push(call);
      const query = {};
      for (const method of [
        "select",
        "order",
        "range",
        "eq",
        "ilike",
        "gte",
        "lte",
        "or",
        "limit",
      ]) {
        query[method] = (...args) => {
          call.operations.push([method, ...args]);
          return query;
        };
      }
      query.then = (resolve, reject) =>
        Promise.resolve(
          responses[view] || { data: [], count: 0, error: null },
        ).then(resolve, reject);
      return query;
    },
  };
  const api = runInNewContext(
    `${isolatedSource}\n({ normalizeListingFilters, getListings, toListingItem })`,
    {
      cache: (fn) => fn,
      createClient: async () => client,
      getPublicImageUrl: () => null,
      ITEM_IMAGES_BUCKET: "item-images",
    },
  );
  return { api, calls };
}

function row(id, createdAt) {
  return {
    id,
    item_name: `Fixture ${id}`,
    category: "Accessories",
    location: "Library",
    item_date: "2026-09-01",
    status: "open",
    created_at: createdAt,
    image_path: null,
  };
}

test("browse defaults stay newest first and reject unrecognized status/sort", () => {
  const { api } = setup();
  const defaults = api.normalizeListingFilters();
  assert.equal(defaults.sort, "newest");
  assert.equal(defaults.status, "");
  assert.equal(defaults.page, 1);
  const invalid = api.normalizeListingFilters({
    status: "private",
    sort: "reporter_id",
    page: "-3",
  });
  assert.equal(invalid.sort, "newest");
  assert.equal(invalid.status, "");
  assert.equal(invalid.page, 1);
  for (const status of ["open", "matched", "resolved"]) {
    assert.equal(api.normalizeListingFilters({ status }).status, status);
  }
});

test("status, sort, public keyword filters and page range reach the safe unified view", async () => {
  const { api, calls } = setup();
  await api.getListings(
    api.normalizeListingFilters({
      q: "Blue bag",
      category: "Bags",
      type: "found",
      status: "open",
      sort: "oldest",
      location: "Main library",
      from: "2026-09-01",
      to: "2026-09-20",
      page: "2",
    }),
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].view, "item_listings");
  const operations = JSON.stringify(calls[0].operations);
  for (const expected of [
    ["order", "created_at", { ascending: true }],
    ["range", 12, 23],
    ["eq", "status", "open"],
    ["eq", "category", "Bags"],
    ["eq", "report_type", "found"],
    ["ilike", "location", "%Main%library%"],
    ["gte", "item_date", "2026-09-01"],
    ["lte", "item_date", "2026-09-20"],
  ])
    assert.ok(
      operations.includes(JSON.stringify(expected)),
      JSON.stringify(expected),
    );
  const search = calls[0].operations.find(([method]) => method === "or")[1];
  assert.deepEqual(
    search.split(",").map((part) => part.split(".")[0]),
    ["item_name", "category", "brand", "color", "description", "location"],
  );
  assert.doesNotMatch(operations, /reporter_id|private_details|phone|email/);
});

test("newest sorting preserves the original descending query", async () => {
  const { api, calls } = setup();
  await api.getListings();
  assert.ok(
    calls[0].operations.some(
      ([method, field, options]) =>
        method === "order" &&
        field === "created_at" &&
        options.ascending === false,
    ),
  );
});

test("fallback views apply status and merge both report types in the selected order", async () => {
  for (const sort of ["oldest", "newest"]) {
    const { api, calls } = setup({
      item_listings: { error: { code: "PGRST205" } },
      lost_item_listings: {
        data: [row("lost", "2026-09-02T00:00:00Z")],
        count: 1,
      },
      found_item_listings: {
        data: [row("found", "2026-09-01T00:00:00Z")],
        count: 1,
      },
    });
    const result = await api.getListings(
      api.normalizeListingFilters({ status: "open", sort }),
    );
    assert.equal(
      result.items[0].reportId,
      sort === "oldest" ? "found" : "lost",
    );
    assert.equal(result.totalCount, 2);
    assert.equal(result.totalPages, 1);
    for (const call of calls.slice(1)) {
      assert.ok(
        call.operations.some(
          ([method, field, value]) =>
            method === "eq" && field === "status" && value === "open",
        ),
      );
      assert.ok(
        call.operations.some(
          ([method, field, options]) =>
            method === "order" &&
            field === "created_at" &&
            options.ascending === (sort === "oldest"),
        ),
      );
    }
  }
});

test("invalid date range shows validation and never queries Supabase", async () => {
  const { api, calls } = setup();
  const result = await api.getListings(
    api.normalizeListingFilters({ from: "2026-09-20", to: "2026-09-01" }),
  );
  assert.match(result.filterError, /start date/);
  assert.equal(calls.length, 0);
});

test("listing projection does not expose private data even if an upstream row contains it", () => {
  const { api } = setup();
  const listing = api.toListingItem(
    {
      ...row("found", "2026-09-01T00:00:00Z"),
      reporter_id: "private-user",
      private_details: "secret",
      email: "private@example.test",
      phone: "private",
    },
    "Found",
  );
  assert.doesNotMatch(
    JSON.stringify(listing),
    /private-user|private_details|secret|email|phone/,
  );
});

test("normal-user navigation never includes admin access", async () => {
  const navigationSource = await readFile(
    new URL("../lib/portal-navigation.js", import.meta.url),
    "utf8",
  );
  const { getPortalNavigation } = await import(
    `data:text/javascript;base64,${Buffer.from(navigationSource).toString("base64")}`
  );
  for (const role of [undefined, null, "user", "ADMIN"]) {
    assert.equal(
      getPortalNavigation(role).some(([href]) => href === "/admin"),
      false,
    );
  }
  assert.equal(
    getPortalNavigation("admin").filter(([href]) => href === "/admin").length,
    1,
  );
});
