import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenize";

describe("tokenize", () => {
  it("records offsets that match the original text", () => {
    const text = "I had muscle pain and fatigue after starting Lipitor, plus some joint pain.";
    for (const tok of tokenize(text)) {
      expect(text.slice(tok.start, tok.end)).toBe(tok.text);
    }
  });

  it("splits punctuation off words", () => {
    const words = tokenize("starting Lipitor, plus").map((t) => t.text);
    expect(words).toEqual(["starting", "Lipitor", ",", "plus"]);
  });

  it("keeps apostrophes inside words and splits hyphens", () => {
    const words = tokenize("I couldn't stand the side-effects").map((t) => t.text);
    expect(words).toEqual(["I", "couldn't", "stand", "the", "side", "-", "effects"]);
  });

  it("never includes whitespace or line breaks in a token", () => {
    const tokens = tokenize("first week.\nMy legs");
    expect(tokens.map((t) => t.text)).toEqual(["first", "week", ".", "My", "legs"]);
  });

  it("can rebuild the exact original text from tokens plus the gaps between them", () => {
    const text = "  Took Arthrotec.\n\nStomach cramps  and bloating ";
    const tokens = tokenize(text);
    let rebuilt = "";
    tokens.forEach((tok, i) => {
      rebuilt += text.slice(i === 0 ? 0 : tokens[i - 1].end, tok.start) + tok.text;
    });
    rebuilt += text.slice(tokens[tokens.length - 1].end);
    expect(rebuilt).toBe(text);
  });

  it("returns no tokens for empty or whitespace-only text", () => {
    expect(tokenize("")).toHaveLength(0);
    expect(tokenize(" \n ")).toHaveLength(0);
  });
});
