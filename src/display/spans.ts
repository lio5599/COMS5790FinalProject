import type { Entity, Span } from "../types";
import type { Token } from "./tokenize";

/** True if the span shares at least one character with [start, end). */
export function overlaps(span: Span, start: number, end: number): boolean {
  return span[0] < end && start < span[1];
}

/**
 * Entities that have a fragment touching this token.
 * A token in the gap between two fragments is NOT covered: in
 * "muscle pain and fatigue", "pain" is not part of "muscle … fatigue".
 */
export function entitiesAt(token: Token, entities: Entity[]): Entity[] {
  return entities.filter((e) => e.spans.some((s) => overlaps(s, token.start, token.end)));
}

/**
 * True if the token sits in the gap of a discontinuous entity: between its
 * first and last fragment, but not part of any fragment. In
 * "muscle pain and fatigue", "pain" and "and" are in the gap of
 * "muscle … fatigue". The display draws a dashed bridge there.
 * Continuous entities have no gap, so this is always false for them.
 */
export function inGap(token: Token, entity: Entity): boolean {
  const first = entity.spans[0][0];
  const last = entity.spans[entity.spans.length - 1][1];
  const insideRange = token.start >= first && token.end <= last;
  const inAFragment = entity.spans.some((s) => overlaps(s, token.start, token.end));
  return insideRange && !inAFragment;
}

/**
 * Entities in reading order: by where they start, then where they end, then
 * by id (numerically, so T2 comes before T10). Returns a new array.
 */
export function sortEntities(entities: Entity[]): Entity[] {
  const first = (e: Entity) => e.spans[0][0];
  const last = (e: Entity) => e.spans[e.spans.length - 1][1];
  return [...entities].sort(
    (a, b) =>
      first(a) - first(b) ||
      last(a) - last(b) ||
      a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
}

/** Readable label for an entity, e.g. "muscle … fatigue". */
export function entityText(text: string, entity: Entity): string {
  return entity.spans.map(([start, end]) => text.slice(start, end)).join(" … ");
}
