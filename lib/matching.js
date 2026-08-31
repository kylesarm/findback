const MATCH_WEIGHTS = Object.freeze({
  category: 25,
  brand: 15,
  color: 15,
  location: 15,
  date: 15,
  description: 15,
});

export const MINIMUM_MATCH_SCORE = 50;

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
    Math.min(normalizedLeft.length, normalizedRight.length) >= 3
    && (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  ) {
    return 0.85;
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

  if (similarity >= 0.65) {
    return { points: 12, reason: "Brand is very similar" };
  }

  if (similarity >= 0.35) {
    return { points: 7, reason: "Brand is similar" };
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
    return { points: 12, reason: "Color is similar" };
  }

  if (textSimilarity(lostColor, foundColor) >= 0.5) {
    return { points: 8, reason: "Color description is similar" };
  }

  return { points: 0 };
}

function compareLocation(lostItem, foundItem) {
  const lostLocation = normalize(lostItem.location);
  const foundLocation = normalize(foundItem.location);
  const similarity = textSimilarity(lostLocation, foundLocation);

  if (similarity === 1) {
    return { points: MATCH_WEIGHTS.location, reason: "Same location" };
  }

  if (similarity >= 0.65) {
    return { points: 12, reason: "Location is very similar" };
  }

  if (similarity >= 0.35) {
    return { points: 8, reason: "Location is similar" };
  }

  return { points: 0 };
}

function daysBetween(leftDate, rightDate) {
  const left = Date.parse(`${leftDate}T00:00:00Z`);
  const right = Date.parse(`${rightDate}T00:00:00Z`);

  if (Number.isNaN(left) || Number.isNaN(right)) return Number.POSITIVE_INFINITY;
  return Math.round(Math.abs(left - right) / 86_400_000);
}

function compareDate(lostItem, foundItem) {
  const difference = daysBetween(lostItem.item_date, foundItem.item_date);
  const suffix = difference === 1 ? "day" : "days";

  if (difference === 0) {
    return { points: MATCH_WEIGHTS.date, reason: "Reported on the same date", difference };
  }

  if (difference <= 1) return { points: 13, reason: `Dates are ${difference} ${suffix} apart`, difference };
  if (difference <= 3) return { points: 10, reason: `Dates are ${difference} ${suffix} apart`, difference };
  if (difference <= 7) return { points: 7, reason: `Dates are ${difference} ${suffix} apart`, difference };
  if (difference <= 14) return { points: 4, reason: `Dates are ${difference} ${suffix} apart`, difference };

  return { points: 0, difference };
}

function descriptionKeywords(value) {
  return new Set(
    tokens(value, 3).filter((token) => !STOP_WORDS.has(token)),
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
  const preview = shared.slice(0, 3).join(", ");

  return {
    points,
    reason: `Descriptions share ${shared.length} keyword${shared.length === 1 ? "" : "s"}: ${preview}`,
  };
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
  if (normalize(lostItem.category) !== normalize(foundItem.category)) {
    return null;
  }

  const comparisons = [
    { points: MATCH_WEIGHTS.category, reason: "Same category" },
    compareBrand(lostItem, foundItem),
    compareColor(lostItem, foundItem),
    compareLocation(lostItem, foundItem),
    compareDate(lostItem, foundItem),
    compareDescription(lostItem, foundItem),
  ];
  const score = Math.min(100, comparisons.reduce((total, result) => total + result.points, 0));

  if (score < MINIMUM_MATCH_SCORE) return null;

  return {
    id: `${lostItem.id}:${foundItem.id}`,
    score,
    reasons: comparisons.filter((result) => result.reason).map((result) => result.reason),
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

  return matches.sort((left, right) => (
    right.score - left.score
    || left.dateDifference - right.dateDifference
    || left.foundItem.itemName.localeCompare(right.foundItem.itemName)
  ));
}
