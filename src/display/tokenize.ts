export interface Token {
  text: string;
  /** Character offset where the token starts in the original text. */
  start: number;
  /** End-exclusive offset: text.slice(start, end) === token.text. */
  end: number;
}

// A token is either a word (letters/digits, keeping inner apostrophes, so
// "couldn't" stays whole) or a single punctuation mark. Hyphens split words
// ("side-effects" becomes side, -, effects) so annotators can pick either half.
// Whitespace is never a token: the renderer copies it from the original text,
// which keeps line breaks and offsets intact.
const TOKEN_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    tokens.push({ text: m[0], start, end: start + m[0].length });
  }
  return tokens;
}
