import { describe, expect, it } from "vitest";
import { SAMPLE_DOCS } from "../data/samples";
import { entitiesAt, entityText } from "./spans";
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
