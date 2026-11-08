import type { Entity } from "../types";

/**
 * Give each entity a row number for its underline. Entities whose ranges
 * (first fragment's start to last fragment's end) overlap get different rows.
 *
 * Example (sample 1): "muscle pain" and "muscle … fatigue" share "muscle",
 * so one gets row 0 and the other row 1. "Lipitor" and "joint pain" don't
 * touch anything, so they go back on row 0.
 */
export function assignLanes(entities: Entity[]): Map<string, number> {
  const lanes = new Map<string, number>();

  // Step 1: work out each entity's range. For a discontinuous entity this
  // includes the gap, so "muscle … fatigue" covers "pain and" as well. That
  // keeps the gap clear for the dashed bridge drawn there later.
  const ranges = entities.map((e) => ({
    id: e.id,
    start: e.spans[0][0],
    end: e.spans[e.spans.length - 1][1],
  }));

  // Step 2: sort (a copy, so the caller's array is untouched) by start.
  // Ties: longer range first, then by id, so the result is the same no
  // matter what order the entities arrive in.
  const sorted = [...ranges].sort(
    (a, b) =>
      a.start - b.start ||
      b.end - b.start - (a.end - a.start) ||
      a.id.localeCompare(b.id),
  );

  // Step 3: freeFrom[row] = the position where that row becomes free again,
  // i.e. the end of the last entity placed in it.
  const freeFrom: number[] = [];

  // Step 4: place each entity in the first row that's free at its start.
  // `<=` because ends are exclusive: an entity ending at 12 and one
  // starting at 12 share no characters, so they can share a row.
  for (const r of sorted) {
    let row = freeFrom.findIndex((free) => free <= r.start);
    if (row === -1) row = freeFrom.length; // no free row: open a new one
    freeFrom[row] = r.end;
    lanes.set(r.id, row);
  }

  return lanes;
}
