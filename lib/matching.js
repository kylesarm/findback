export const MATCH_WEIGHTS = Object.freeze({
  category: 25,
  brand: 15,
  color: 15,
  location: 15,
  date: 15,
  description: 15,
});

export const TOTAL_MATCH_WEIGHT = Object.values(MATCH_WEIGHTS).reduce((total, weight) => total + weight, 0);
export const MINIMUM_MATCH_SCORE = 50;

const MATCH_THRESHOLDS = Object.freeze({
  containmentMinimumLength: 3,
  containmentSimilarity: 0.85,
  brandVerySimilar: 0.65,
  brandSimilar: 0.35,
  colorSimilar: 0.5,
  locationVerySimilar: 0.65,
  locationSimilar: 0.35,
  descriptionTokenMinimumLength: 3,
});

const PARTIAL_MATCH_POINTS = Object.freeze({
  brandVerySimilar: 12,
  brandSimilar: 7,
  colorAlias: 12,
  colorTextSimilar: 8,
  locationVerySimilar: 12,
  locationSimilar: 8,
});

const DATE_SCORING_BANDS = Object.freeze([
  Object.freeze({ maximumDaysAfter: 0, points: MATCH_WEIGHTS.date }),
  Object.freeze({ maximumDaysAfter: 2, points: 13 }),
  Object.freeze({ maximumDaysAfter: 7, points: 10 }),
  Object.freeze({ maximumDaysAfter: 14, points: 6 }),
  Object.freeze({ maximumDaysAfter: 30, points: 3 }),
]);

const MILLISECONDS_PER_DAY = 86_400_000;
const DESCRIPTION_EXPLANATION_KEYWORD_LIMIT = 3;

const STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "been", "but", "for", "from",
  "had", "has", "have", "into", "item", "lost", "near", "not", "that",
  "the", "their", "there", "this", "was", "were", "with",
]);

const COLOR_ALIASES = new Map([
  ["grey", "gray"],
  ["silver", "gray"],
  ["charcoal", "gray"],
  ["navy", "blue"],
  ["azure", "blue"],
  ["maroon", "red"],
  ["burgundy", "red"],
  ["crimson", "red"],
  ["violet", "purple"],
  ["lavender", "purple"],
  ["beige", "brown"],
  ["tan", "brown"],
  ["cream", "white"],
]);

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value, minimumLength = 2) {
  const normalized = normalize(value);
  return normalized
    ? normalized.split(" ").filter((token) => token.length >= minimumLength)
    : [];
}

function textSimilarity(left, right) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);

  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;

  if (
    Math.min(normalizedLeft.length, normalizedRight.length) >= MATCH_THRESHOLDS.containmentMinimumLength
    && (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  ) {
    return MATCH_THRESHOLDS.containmentSimilarity;
  }

  const leftTokens = new Set(tokens(normalizedLeft));
  const rightTokens = new Set(tokens(normalizedRight));
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;

  return overlap === 0 ? 0 : (2 * overlap) / (leftTokens.size + rightTokens.size);
}

function canonicalColorTokens(value) {
  return new Set(tokens(value).map((token) => COLOR_ALIASES.get(token) || token));
}

function compareBrand(lostItem, foundItem) {
  const similarity = textSimilarity(lostItem.brand, foundItem.brand);

  if (similarity === 1) {
    return { points: MATCH_WEIGHTS.brand, reason: "Same brand" };
  }

  if (similarity >= MATCH_THRESHOLDS.brandVerySimilar) {
    return { points: PARTIAL_MATCH_POINTS.brandVerySimilar, reason: "Similar brand" };
  }

  if (similarity >= MATCH_THRESHOLDS.brandSimilar) {
    return { points: PARTIAL_MATCH_POINTS.brandSimilar, reason: "Similar brand" };
  }

  return { points: 0 };
}

function compareColor(lostItem, foundItem) {
  const lostColor = normalize(lostItem.color);
  const foundColor = normalize(foundItem.color);

  if (!lostColor || !foundColor) return { points: 0 };
  if (lostColor === foundColor) {
    return { points: MATCH_WEIGHTS.color, reason: "Same color" };
  }

  const lostColors = canonicalColorTokens(lostColor);
  const foundColors = canonicalColorTokens(foundColor);
  const related = [...lostColors].some((color) => foundColors.has(color));

  if (related) {
    return { points: PARTIAL_MATCH_POINTS.colorAlias, reason: "Similar color" };
  }

  if (textSimilarity(lostColor, foundColor) >= MATCH_THRESHOLDS.colorSimilar) {
    return { points: PARTIAL_MATCH_POINTS.colorTextSimilar, reason: "Similar color" };
  }

  return { points: 0 };
}

function compareLocation(lostItem, foundItem) {
  const similarity = textSimilarity(lostItem.location, foundItem.location);

  if (similarity === 1) {
    return { points: MATCH_WEIGHTS.location, reason: "Same location" };
  }

  if (similarity >= MATCH_THRESHOLDS.locationVerySimilar) {
    return { points: PARTIAL_MATCH_POINTS.locationVerySimilar, reason: "Similar location" };
  }

  if (similarity >= MATCH_THRESHOLDS.locationSimilar) {
    return { points: PARTIAL_MATCH_POINTS.locationSimilar, reason: "Similar location" };
  }

  return { points: 0 };
}

function daysAfterLostDate(lostDate, foundDate) {
  const lost = Date.parse(`${lostDate}T00:00:00Z`);
  const found = Date.parse(`${foundDate}T00:00:00Z`);

  if (Number.isNaN(lost) || Number.isNaN(found)) return null;
  return Math.round((found - lost) / MILLISECONDS_PER_DAY);
}

function compareDate(lostItem, foundItem) {
  const difference = daysAfterLostDate(lostItem.item_date, foundItem.item_date);

  if (difference === null || difference < 0) {
    return { points: 0, difference: null };
  }

  const band = DATE_SCORING_BANDS.find(({ maximumDaysAfter }) => difference <= maximumDaysAfter);
  if (!band) return { points: 0, difference };

  const timing = difference === 0
    ? "same day"
    : `${difference} day${difference === 1 ? "" : "s"} after`;

  return {
    points: band.points,
    reason: `Dates are close (${timing})`,
    difference,
  };
}

function descriptionKeywords(value) {
  return new Set(
    tokens(value, MATCH_THRESHOLDS.descriptionTokenMinimumLength)
      .filter((token) => !STOP_WORDS.has(token)),
  );
}

function compareDescription(lostItem, foundItem) {
  const lostKeywords = descriptionKeywords(lostItem.description);
  const foundKeywords = descriptionKeywords(foundItem.description);
  const shared = [...lostKeywords].filter((keyword) => foundKeywords.has(keyword));

  if (shared.length === 0) return { points: 0 };

  const possibleOverlap = Math.min(lostKeywords.size, foundKeywords.size);
  const similarity = possibleOverlap === 0 ? 0 : shared.length / possibleOverlap;
  const points = Math.max(1, Math.round(MATCH_WEIGHTS.description * similarity));
  const preview = shared.slice(0, DESCRIPTION_EXPLANATION_KEYWORD_LIMIT).join(", ");

  return {
    points,
    reason: `Similar description keywords: ${preview}`,
  };
}

function isEligibleCandidate(lostItem, foundItem) {
  const lostCategory = normalize(lostItem.category);
  const foundCategory = normalize(foundItem.category);
  return Boolean(lostCategory && lostCategory === foundCategory);
}

function toSafeItem(item) {
  return {
    id: item.id,
    itemName: item.item_name,
    category: item.category,
    brand: item.brand,
    color: item.color,
    description: item.description,
    location: item.location,
    itemDate: item.item_date,
    imagePath: item.image_path,
    status: item.status,
  };
}

export function scoreItemPair(lostItem, foundItem) {
  // Stage 1: candidate eligibility. Only equal normalized categories advance.
  if (!isEligibleCandidate(lostItem, foundItem)) return null;

  // Stage 2: weighted similarity scoring for the eligible item pair.
  const comparisons = [
    { points: MATCH_WEIGHTS.category, reason: "Same category" },
    compareBrand(lostItem, foundItem),
    compareColor(lostItem, foundItem),
    compareLocation(lostItem, foundItem),
    compareDate(lostItem, foundItem),
    compareDescription(lostItem, foundItem),
  ];
  const score = Math.min(
    TOTAL_MATCH_WEIGHT,
    comparisons.reduce((total, result) => total + result.points, 0),
  );

  if (score < MINIMUM_MATCH_SCORE) return null;

  return {
    id: `${lostItem.id}:${foundItem.id}`,
    score,
    reasons: comparisons.filter((result) => result.points > 0).map((result) => result.reason),
    dateDifference: comparisons[4].difference,
    lostItem: toSafeItem(lostItem),
    foundItem: toSafeItem(foundItem),
  };
}

export function findPossibleMatches(lostItems, foundItems) {
  const matches = [];

  for (const lostItem of lostItems) {
    for (const foundItem of foundItems) {
      const match = scoreItemPair(lostItem, foundItem);
      if (match) matches.push(match);
    }
  }

  return matches.sort((left, right) => {
    const leftDateDifference = Number.isFinite(left.dateDifference) ? left.dateDifference : Number.POSITIVE_INFINITY;
    const rightDateDifference = Number.isFinite(right.dateDifference) ? right.dateDifference : Number.POSITIVE_INFINITY;

    return right.score - left.score
      || leftDateDifference - rightDateDifference
      || left.foundItem.itemName.localeCompare(right.foundItem.itemName);
  });
}
