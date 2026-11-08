import { describe, expect, it } from "vitest";
import { SAMPLE_DOCS } from "../data/samples";
import { entitiesAt, entityText, inGap, sortEntities } from "./spans";
import type { Entity } from "../types";
import { tokenize } from "./tokenize";

const doc = SAMPLE_DOCS[0]; // "I had muscle pain and fatigue ..."
const tokenAt = (word: string) => tokenize(doc.text).find((t) => t.text === word)!;
const idsAt = (word: string) => entitiesAt(tokenAt(word), doc.entities).map((e) => e.id);

describe("entitiesAt", () => {
  it("finds both entities on a shared word", () => {
    expect(idsAt("muscle")).toEqual(["T1", "T2"]);
  });

  it("does not count a word in the gap of a discontinuous entity", () => {
    expect(idsAt("pain")).toEqual(["T1"]); // first "pain": in T1, but a gap for T2
    expect(idsAt("and")).toEqual([]);
  });

  it("finds the second fragment of a discontinuous entity", () => {
    expect(idsAt("fatigue")).toEqual(["T2"]);
  });
});

describe("inGap", () => {
  const T1 = doc.entities[0]; // "muscle pain" (continuous)
  const T2 = doc.entities[1]; // "muscle … fatigue" (discontinuous)

  it("is true for words between the two fragments", () => {
    expect(inGap(tokenAt("pain"), T2)).toBe(true);
    expect(inGap(tokenAt("and"), T2)).toBe(true);
  });

  it("is true for the spaces between the fragments too", () => {
    expect(inGap({ text: " ", start: 12, end: 13 }, T2)).toBe(true); // after "muscle"
    expect(inGap({ text: " ", start: 21, end: 22 }, T2)).toBe(true); // before "fatigue"
  });

  it("is false for the fragments themselves and for words outside the entity", () => {
    expect(inGap(tokenAt("muscle"), T2)).toBe(false);
    expect(inGap(tokenAt("fatigue"), T2)).toBe(false);
    expect(inGap(tokenAt("had"), T2)).toBe(false);
    expect(inGap(tokenAt("after"), T2)).toBe(false);
  });

  it("is always false for a continuous entity", () => {
    for (const tok of tokenize(doc.text)) expect(inGap(tok, T1)).toBe(false);
  });

  it("handles interleaved entities (sample 2)", () => {
    const doc2 = SAMPLE_DOCS[1];
    const [T5, T6] = [doc2.entities[4], doc2.entities[5]]; // legs … weak, arms … weak
    const arms = tokenize(doc2.text).find((t) => t.text === "arms")!;
    expect(inGap(arms, T5)).toBe(true); // "arms" is skipped by "legs … weak"
    expect(inGap(arms, T6)).toBe(false); // but it's the first piece of "arms … weak"
  });
});

describe("sortEntities", () => {
  it("orders entities by where they start, then where they end", () => {
    const shuffled: Entity[] = [
      { id: "T3", type: "Drug", spans: [[45, 52]] },
      { id: "T2", type: "ADR", spans: [[6, 12], [22, 29]] },
      { id: "T1", type: "ADR", spans: [[6, 17]] },
    ];
    expect(sortEntities(shuffled).map((e) => e.id)).toEqual(["T1", "T2", "T3"]);
  });

  it("breaks exact ties by id, numerically (T2 before T10)", () => {
    const tied: Entity[] = [
      { id: "T10", type: "ADR", spans: [[0, 4]] },
      { id: "T2", type: "ADR", spans: [[0, 4]] },
    ];
    expect(sortEntities(tied).map((e) => e.id)).toEqual(["T2", "T10"]);
  });

  it("doesn't change the original array", () => {
    const original = [...doc.entities].reverse();
    const ids = original.map((e) => e.id);
    sortEntities(original);
    expect(original.map((e) => e.id)).toEqual(ids);
  });
});

describe("entityText", () => {
  it("joins fragments with an ellipsis", () => {
    expect(entityText(doc.text, doc.entities[1])).toBe("muscle … fatigue");
  });
});

describe("sample documents", () => {
  it("have valid, sorted spans whose text matches", () => {
    for (const d of SAMPLE_DOCS) {
      for (const e of d.entities) {
        e.spans.forEach(([start, end], i) => {
          expect(start < end && end <= d.text.length).toBe(true);
          if (i > 0) expect(e.spans[i - 1][1] <= start).toBe(true);
        });
        expect(entityText(d.text, e)).toBe(e.text);
      }
    }
  });
});
