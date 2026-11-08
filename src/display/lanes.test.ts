import { describe, expect, it } from "vitest";
import type { Entity } from "../types";
import { SAMPLE_DOCS } from "../data/samples";
import { assignLanes } from "./lanes";

const sample1 = SAMPLE_DOCS[0].entities; // muscle pain, muscle … fatigue, Lipitor, joint pain
const sample2 = SAMPLE_DOCS[1].entities; // includes legs … weak and arms … weak

// Number of rows used = highest row number + 1
const rowCount = (lanes: Map<string, number>) => Math.max(...lanes.values()) + 1;

describe("assignLanes", () => {
  it("puts entities that never overlap on row 0", () => {
    const separate: Entity[] = [
      { id: "A", type: "ADR", spans: [[0, 5]] },
      { id: "B", type: "ADR", spans: [[10, 15]] },
      { id: "C", type: "Drug", spans: [[20, 25]] },
    ];
    expect([...assignLanes(separate).values()]).toEqual([0, 0, 0]);
  });

  it("puts T1 and T2 in sample-1 on different rows (they share 'muscle')", () => {
    const lanes = assignLanes(sample1);
    expect(lanes.get("T1")).not.toBe(lanes.get("T2"));
  });

  it("treats the gap of a discontinuous entity as occupied (T2 spans 'pain and')", () => {
    const entities: Entity[] = [
      { id: "T2", type: "ADR", spans: [[6, 12], [22, 29]] }, // muscle … fatigue
      { id: "X", type: "ADR", spans: [[18, 21]] }, // "and": inside T2's gap
    ];
    const lanes = assignLanes(entities);
    expect(lanes.get("X")).not.toBe(lanes.get("T2"));
  });

  it("gives T5 and T6 in sample-2 different rows (they interleave and share 'weak')", () => {
    const lanes = assignLanes(sample2);
    expect(lanes.get("T5")).not.toBe(lanes.get("T6"));
    expect(lanes.get("T3")).not.toBe(lanes.get("T4")); // Stomach cramps / Stomach … bloating
  });

  it("uses as few rows as possible (sample-1 needs exactly 2)", () => {
    expect(rowCount(assignLanes(sample1))).toBe(2);
    expect(rowCount(assignLanes(sample2))).toBe(2);
  });

  it("returns the same result when the entities array is in a different order", () => {
    for (const entities of [sample1, sample2]) {
      const forward = assignLanes(entities);
      const backward = assignLanes([...entities].reverse());
      expect(Object.fromEntries(backward)).toEqual(Object.fromEntries(forward));
    }
  });
});