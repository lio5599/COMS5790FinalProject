// Shared data format for the whole team (display, annotation, and file I/O).
// Agree on this file first, and tell the others before changing it.
//
// Offsets are character positions in `text`, end-exclusive, so a span
// [start, end] covers text.slice(start, end).
// Careful: JavaScript counts UTF-16 code units and Python counts code points,
// so emoji can shift offsets if any script is written in Python.

/** One continuous piece of an entity. */
export type Span = [start: number, end: number];

export interface Entity {
  /** Unique within a document, e.g. "T1". */
  id: string;
  /** Entity type, e.g. "ADR" or "Drug". */
  type: string;
  /** One span = continuous entity; two or more = discontinuous. Sorted, non-overlapping. */
  spans: Span[];
  /** Optional, for people reading the JSON: fragments joined with " … ". */
  text?: string;
}

export interface AnnotatedDocument {
  id?: string;
  text: string;
  entities: Entity[];
}

/** The five entity types used in CADEC. */
export const CADEC_TYPES = ["ADR", "Drug", "Disease", "Symptom", "Finding"] as const;
