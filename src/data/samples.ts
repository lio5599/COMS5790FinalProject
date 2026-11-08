import type { AnnotatedDocument } from "../types";

// Hand-written test documents in the shared JSON format (written in the style
// of CADEC posts, not copied from it). Use these until Person C's CADEC
// converter is ready. Each one exercises a case the display has to handle.
export const SAMPLE_DOCS: AnnotatedDocument[] = [
  {
    // "muscle" belongs to two entities; T2 skips over "pain and".
    id: "sample-1-overlap",
    text: "I had muscle pain and fatigue after starting Lipitor, plus some joint pain.",
    entities: [
      { id: "T1", type: "ADR", spans: [[6, 17]], text: "muscle pain" },
      { id: "T2", type: "ADR", spans: [[6, 12], [22, 29]], text: "muscle … fatigue" },
      { id: "T3", type: "Drug", spans: [[45, 52]], text: "Lipitor" },
      { id: "T4", type: "ADR", spans: [[64, 74]], text: "joint pain" },
    ],
  },
  {
    // Hardest case: T5 and T6 interleave (legs … weak / arms … weak share
    // "weak"), and there's a line break in the text.
    id: "sample-2-interleaved",
    text:
      "Took Arthrotec for 3 weeks for my arthritis. Stomach cramps and bloating started in the first week.\n" +
      "My legs and arms felt weak and heavy most days, and I couldn't sleep.",
    entities: [
      { id: "T1", type: "Drug", spans: [[5, 14]], text: "Arthrotec" },
      { id: "T2", type: "Disease", spans: [[34, 43]], text: "arthritis" },
      { id: "T3", type: "ADR", spans: [[45, 59]], text: "Stomach cramps" },
      { id: "T4", type: "ADR", spans: [[45, 52], [64, 72]], text: "Stomach … bloating" },
      { id: "T5", type: "ADR", spans: [[103, 107], [122, 126]], text: "legs … weak" },
      { id: "T6", type: "ADR", spans: [[112, 116], [122, 126]], text: "arms … weak" },
      { id: "T7", type: "ADR", spans: [[154, 168]], text: "couldn't sleep" },
    ],
  },
  {
    // Use case 1: raw text with nothing annotated yet.
    id: "sample-3-unannotated",
    text: "Started on Voltaren last month. No side effects so far except mild headaches.",
    entities: [],
  },
];
