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

/** Readable label for an entity, e.g. "muscle … fatigue". */
export function entityText(text: string, entity: Entity): string {
  return entity.spans.map(([start, end]) => text.slice(start, end)).join(" … ");
}
