import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const matchingSource = await readFile(new URL("../lib/matching.js", import.meta.url), "utf8");
const matchingModuleUrl = `data:text/javascript;base64,${Buffer.from(matchingSource).toString("base64")}`;
const {
  MATCH_WEIGHTS,
  MINIMUM_MATCH_SCORE,
  TOTAL_MATCH_WEIGHT,
  scoreItemPair,
} = await import(matchingModuleUrl);

function item(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    item_name: "Test item",
    category: "Electronics",
    brand: null,
    color: null,
    description: "",
    location: "",
    item_date: "2026-09-01",
    image_path: null,
    status: "open",
    ...overrides,
  };
}

test("official weights total exactly 100 points", () => {
  assert.deepEqual(MATCH_WEIGHTS, {
    category: 25,
    brand: 15,
    color: 15,
    location: 15,
    date: 15,
    description: 15,
  });
  assert.equal(TOTAL_MATCH_WEIGHT, 100);
  assert.equal(MINIMUM_MATCH_SCORE, 50);
});

test("different normalized categories are rejected before scoring", () => {
  const lostItem = item({ category: "Electronics", brand: "Acme", color: "Blue" });
  const foundItem = item({ category: "Bags", brand: "Acme", color: "Blue" });

  assert.equal(scoreItemPair(lostItem, foundItem), null);
});

test("a perfect eligible pair scores exactly 100", () => {
  const details = {
    category: "Electronics",
    brand: "Acme",
    color: "Navy blue",
    location: "Main Library",
    item_date: "2026-09-01",
    description: "Black case with charging cable",
  };
  const result = scoreItemPair(item(details), item(details));

  assert.equal(result.score, 100);
  assert.deepEqual(result.reasons, [
    "Same category",
    "Same brand",
    "Same color",
    "Same location",
    "Dates are close (same day)",
    "Similar description keywords: black, case, charging",
  ]);
});

test("date scoring uses only days on or after the lost date", () => {
  const lostItem = item({ brand: "Acme", color: "Blue", item_date: "2026-09-10" });
  const expectedScores = new Map([
    ["2026-09-09", 55],
    ["2026-09-10", 70],
    ["2026-09-11", 68],
    ["2026-09-12", 68],
    ["2026-09-13", 65],
    ["2026-09-17", 65],
    ["2026-09-18", 61],
    ["2026-09-24", 61],
    ["2026-09-25", 58],
    ["2026-10-10", 58],
    ["2026-10-11", 55],
  ]);

  for (const [foundDate, expectedScore] of expectedScores) {
    const result = scoreItemPair(lostItem, item({ brand: "Acme", color: "Blue", item_date: foundDate }));
    assert.equal(result.score, expectedScore, `unexpected score for found date ${foundDate}`);
  }

  const beforeLostDate = scoreItemPair(lostItem, item({ brand: "Acme", color: "Blue", item_date: "2026-09-09" }));
  assert.equal(beforeLostDate.reasons.some((reason) => reason.startsWith("Dates are close")), false);
});

test("the 50-point display threshold is inclusive", () => {
  const lostItem = item({ brand: "Acme", item_date: "2026-09-01" });
  const exactlyFifty = scoreItemPair(lostItem, item({ brand: "Acme", item_date: "2026-09-04" }));
  const belowFifty = scoreItemPair(lostItem, item({ brand: "Acme", item_date: "2026-09-09" }));

  assert.equal(exactlyFifty.score, 50);
  assert.equal(belowFifty, null);
});

test("explanations identify every attribute that contributes points", () => {
  const lostItem = item({
    brand: "Apple",
    color: "Navy",
    location: "Main Library",
    item_date: "2026-09-01",
    description: "Black zipper pocket",
  });
  const foundItem = item({
    brand: "Apple Inc",
    color: "Blue",
    location: "Library",
    item_date: "2026-09-02",
    description: "Small black zipper pocket",
  });
  const result = scoreItemPair(lostItem, foundItem);

  assert.deepEqual(result.reasons, [
    "Same category",
    "Similar brand",
    "Similar color",
    "Similar location",
    "Dates are close (1 day after)",
    "Similar description keywords: black, zipper, pocket",
  ]);
});
