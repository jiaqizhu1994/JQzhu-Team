export type IndexedItem<T> = {
  item: T;
  index: number;
};

function withOriginalIndex<T>(items: readonly T[]): IndexedItem<T>[] {
  return items.map((item, index) => ({ item, index }));
}

function dateValue(value: string) {
  const parsed = Date.parse(value || "1900-01-01");
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function yearValue(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

export function orderNewsItems<T extends { pinned: boolean; date: string }>(
  items: readonly T[],
) {
  return withOriginalIndex(items).sort(
    (left, right) =>
      Number(right.item.pinned) - Number(left.item.pinned) ||
      dateValue(right.item.date) - dateValue(left.item.date) ||
      left.index - right.index,
  );
}

export function orderPublicationItems<T extends { year: string }>(
  items: readonly T[],
) {
  return withOriginalIndex(items).sort(
    (left, right) =>
      yearValue(right.item.year) - yearValue(left.item.year) ||
      left.index - right.index,
  );
}

export function orderActivityItems<T extends { date: string }>(
  items: readonly T[],
) {
  return withOriginalIndex(items).sort(
    (left, right) =>
      dateValue(right.item.date) - dateValue(left.item.date) ||
      left.index - right.index,
  );
}
