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
  {
    // Stress test: a long, messy post. Four entities overlap on
    // "pain and stiffness in my left and right shoulders" (needs 4 rows),
    // two have three pieces, two pieces cross a line break ("right\nshoulders"),
    // the text starts and ends with an entity, "Crestor" appears twice, and
    // "I’d" uses a curly apostrophe.
    id: "sample-4-stress",
    text:
      "Lipitor gave me cramping, so Dr. Patel switched me to Crestor for my high cholesterol. Within a week I had severe muscle and joint pain in both legs, plus pain and stiffness in my left and right\n" +
      "shoulders. Also tingling, then numbness, in my fingers and toes. My liver enzymes (ALT) came back high, so she lowered the dose. The chest pain I had before is gone though.\n" +
      "I’d say the leg cramps improved, but the fatigue and brain fog never really went away, so no more Crestor",
    entities: [
      { id: "T1", type: "Drug", spans: [[0, 7]], text: "Lipitor" },
      { id: "T2", type: "ADR", spans: [[16, 24]], text: "cramping" },
      { id: "T3", type: "Drug", spans: [[54, 61]], text: "Crestor" },
      { id: "T4", type: "Disease", spans: [[69, 85]], text: "high cholesterol" },
      { id: "T5", type: "ADR", spans: [[107, 120], [131, 135]], text: "severe muscle … pain" },
      { id: "T6", type: "ADR", spans: [[107, 113], [125, 135]], text: "severe … joint pain" },
      { id: "T7", type: "ADR", spans: [[155, 159], [180, 184], [195, 204]], text: "pain … left … shoulders" },
      { id: "T8", type: "ADR", spans: [[155, 159], [189, 204]], text: "pain … right\nshoulders" },
      { id: "T9", type: "ADR", spans: [[164, 173], [180, 184], [195, 204]], text: "stiffness … left … shoulders" },
      { id: "T10", type: "ADR", spans: [[164, 173], [189, 204]], text: "stiffness … right\nshoulders" },
      { id: "T11", type: "ADR", spans: [[211, 219], [236, 249]], text: "tingling … in my fingers" },
      { id: "T12", type: "ADR", spans: [[226, 234], [254, 258]], text: "numbness … toes" },
      { id: "T13", type: "Finding", spans: [[263, 297]], text: "liver enzymes (ALT) came back high" },
      { id: "T14", type: "Symptom", spans: [[328, 338]], text: "chest pain" },
      { id: "T15", type: "ADR", spans: [[380, 390]], text: "leg cramps" },
      { id: "T16", type: "ADR", spans: [[409, 416]], text: "fatigue" },
      { id: "T17", type: "ADR", spans: [[421, 430]], text: "brain fog" },
      { id: "T18", type: "Drug", spans: [[466, 473]], text: "Crestor" },
    ],
  },
];
