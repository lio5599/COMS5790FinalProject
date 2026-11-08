import { describe, it } from "vitest";

// YOUR NEXT TASK (step 3 in START-HERE.md).
// Create src/display/lanes.ts exporting:
//
//   assignLanes(entities: Entity[]): Map<string, number>
//
// It gives each entity a row number (0, 1, 2, ...) for its underline, so
// entities that share words, or whose range from first to last fragment
// overlaps, never get the same row. Then turn these todos into real tests
// using SAMPLE_DOCS, and implement until they pass.

describe("assignLanes", () => {
  it.todo("puts entities that never overlap on row 0");
  it.todo("puts T1 and T2 in sample-1 on different rows (they share 'muscle')");
  it.todo("treats the gap of a discontinuous entity as occupied (T2 spans 'pain and')");
  it.todo("gives T5 and T6 in sample-2 different rows (they interleave and share 'weak')");
  it.todo("uses as few rows as possible (sample-1 needs exactly 2)");
  it.todo("returns the same result when the entities array is in a different order");
});
