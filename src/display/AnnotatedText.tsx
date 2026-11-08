import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import type { AnnotatedDocument, Entity, Span } from "../types";
import { tokenize, type Token } from "./tokenize";
import { entitiesAt, inGap, overlaps } from "./spans";
import { assignLanes } from "./lanes";
import { FALLBACK_COLOR } from "./colors";
import "./AnnotatedText.css";

interface Props {
  doc: AnnotatedDocument;
  typeColors: Record<string, string>;
  /** Entity ids to emphasize; all other underlines fade. Usually the hovered or selected ones. */
  highlighted?: string[];
  /** Pieces of an entity the user is still building (from Person B). Drawn with a dashed outline. */
  pendingSpans?: Span[];
  /** Called when the pointer moves onto different entities. [] means none. */
  onEntityHover?: (ids: string[]) => void;
  /**
   * Called on a click (not after a drag-selection, which is Person B's).
   * - Clicking an underline gives that one entity: ["T2"].
   * - Clicking a word gives every entity it belongs to: "muscle" → ["T1", "T2"].
   * - Clicking anywhere else gives [].
   */
  onEntityClick?: (ids: string[]) => void;
  /** Scroll this entity into view. Pass a new object each time ({ id: "T5" }) to scroll again. */
  scrollTo?: { id: string } | null;
}

/**
 * The display. Every word is its own <span> carrying its character offsets
 * (data-start / data-end), which Person B reads to turn a mouse selection
 * into offsets.
 *
 * Under each word sit stacked underlines, one per row from assignLanes.
 * In each row, the bar is:
 *   - solid  where the row's entity covers the text (one of its fragments),
 *   - dashed where the text sits in the entity's gap (between fragments),
 *     so "muscle … fatigue" is visibly connected through "pain and",
 *   - empty  otherwise (it still takes up space so the rows line up).
 * Spaces get bars too, so entities read as one unbroken line.
 */
export function AnnotatedText({
  doc,
  typeColors,
  highlighted,
  pendingSpans,
  onEntityHover,
  onEntityClick,
  scrollTo,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => tokenize(doc.text), [doc.text]);
  // Pieces with no space between them ("cholesterol" + ".", or "(" + "ALT" +
  // ")") form a group that must stay on one line, like normal text does.
  const groups = useMemo(() => {
    const result: Token[][] = [];
    for (const tok of tokens) {
      const last = result[result.length - 1];
      if (last && last[last.length - 1].end === tok.start) last.push(tok);
      else result.push([tok]);
    }
    return result;
  }, [tokens]);
  const lanes = useMemo(() => assignLanes(doc.entities), [doc.entities]);
  const rowCount = lanes.size === 0 ? 0 : Math.max(...lanes.values()) + 1;

  // The entities in each row. Entities in one row never overlap (that's
  // what assignLanes guarantees), so at most one of them touches any word.
  const rows = useMemo(() => {
    const result: Entity[][] = Array.from({ length: rowCount }, () => []);
    for (const e of doc.entities) result[lanes.get(e.id) ?? 0].push(e);
    return result;
  }, [doc.entities, lanes, rowCount]);

  const hl = new Set(highlighted ?? []);
  const pending = pendingSpans ?? [];

  // Scroll an entity into view when asked (e.g. picked in the entity list).
  useEffect(() => {
    if (!scrollTo) return;
    const el = containerRef.current?.querySelector(`[data-entities~="${CSS.escape(scrollTo.id)}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTo]);

  // Bar style for one row under a piece of text.
  function barKind(piece: Token, rowEntities: Entity[]) {
    for (const e of rowEntities) {
      if (e.spans.some((s) => overlaps(s, piece.start, piece.end))) return { kind: "solid", e };
      if (inGap(piece, e)) return { kind: "bridge", e };
    }
    return null;
  }

  // One bar per row under a piece of text (a word or the space after it).
  // Each bar carries its entity id, so pointing at a bar means that entity.
  function bars(piece: Token) {
    return rows.map((rowEntities, row) => {
      const hit = barKind(piece, rowEntities);
      if (!hit) return <span key={row} className="bar" />;
      const color = typeColors[hit.e.type] ?? FALLBACK_COLOR;
      const className = `bar ${hit.kind}${hl.has(hit.e.id) ? " hl" : ""}`;
      const style: CSSProperties =
        hit.kind === "solid"
          ? { backgroundColor: color }
          : { backgroundImage: `linear-gradient(to right, ${color} 5px, transparent 5px)` };
      return <span key={row} className={className} data-entity={hit.e.id} style={style} />;
    });
  }

  const hasBar = (piece: Token) => rows.some((rowEntities) => barKind(piece, rowEntities));

  // Entities whose fragments cover this piece (not just bridge over it).
  const solidIds = (piece: Token) => entitiesAt(piece, doc.entities).map((e) => e.id);

  // Light background tint where a highlighted entity covers the text.
  function tint(piece: Token): CSSProperties | undefined {
    const e = entitiesAt(piece, doc.entities).find((x) => hl.has(x.id));
    return e ? ({ "--tint": typeColors[e.type] ?? FALLBACK_COLOR } as CSSProperties) : undefined;
  }

  // Which entities the pointer is on: an underline means its one entity;
  // a word (or a space inside an entity) means every entity it belongs to.
  function idsAt(target: EventTarget | null): string[] {
    if (!(target instanceof Element)) return [];
    const bar = target.closest<HTMLElement>(".bar[data-entity]");
    if (bar) return [bar.dataset.entity ?? ""];
    const piece = target.closest<HTMLElement>("[data-entities]");
    return piece?.dataset.entities ? piece.dataset.entities.split(" ") : [];
  }

  // Only report a hover when it actually changes, not on every mouse move.
  const lastHover = useRef("");
  function reportHover(ids: string[]) {
    const key = ids.join(" ");
    if (key === lastHover.current) return;
    lastHover.current = key;
    onEntityHover?.(ids);
  }

  function handleClick(e: MouseEvent) {
    // A drag that selected text is Person B's (creating an entity), not a click.
    if (window.getSelection()?.toString()) return;
    onEntityClick?.(idsAt(e.target));
  }

  return (
    <div
      ref={containerRef}
      className={hl.size ? "annotated-text has-highlight" : "annotated-text"}
      onMouseOver={(e) => reportHover(idsAt(e.target))}
      onMouseLeave={() => reportHover([])}
      onClick={handleClick}
    >
      {/* Any text before the first word (e.g. leading spaces). */}
      {doc.text.slice(0, tokens.length ? tokens[0].start : doc.text.length)}
      {groups.map((group, g) => {
        const words = group.map((tok) => {
          const ids = solidIds(tok);
          const isPending = pending.some((s) => overlaps(s, tok.start, tok.end));
          const style = tint(tok);
          const className = ["token", ids.length && "annotated", style && "hl", isPending && "pending"]
            .filter(Boolean)
            .join(" ");
          return (
            <span
              key={tok.start}
              className={className}
              data-start={tok.start}
              data-end={tok.end}
              data-entities={ids.length ? ids.join(" ") : undefined}
              title={
                ids.length
                  ? doc.entities
                      .filter((e) => ids.includes(e.id))
                      .map((e) => `${e.id} (${e.type})`)
                      .join(", ")
                  : undefined
              }
              style={style}
            >
              {tok.text}
              {bars(tok)}
            </span>
          );
        });

        // The whitespace after this group, copied from the original text.
        const groupEnd = group[group.length - 1].end;
        const hasNext = g + 1 < groups.length;
        const spaceEnd = hasNext ? groups[g + 1][0].start : doc.text.length;
        const space: Token = { text: doc.text.slice(groupEnd, spaceEnd), start: groupEnd, end: spaceEnd };
        // Spaces under an entity (solid or dashed) get bars and stay glued to
        // the group before them, so a line never starts with one. Spaces with
        // a line break, or at the very end, stay plain text.
        const spaceHasBars = hasNext && space.text !== "" && !space.text.includes("\n") && hasBar(space);
        // A .unit can't be split across lines.
        const needsUnit = group.length > 1 || spaceHasBars;
        const spaceIds = spaceHasBars ? solidIds(space) : [];
        const spaceStyle = spaceHasBars ? tint(space) : undefined;

        return (
          <Fragment key={group[0].start}>
            {needsUnit ? (
              <span className="unit">
                {words}
                {spaceHasBars && (
                  <span
                    className={spaceStyle ? "gap hl" : "gap"}
                    data-entities={spaceIds.length ? spaceIds.join(" ") : undefined}
                    style={spaceStyle}
                  >
                    {space.text}
                    {bars(space)}
                  </span>
                )}
              </span>
            ) : (
              words
            )}
            {!spaceHasBars && space.text}
          </Fragment>
        );
      })}
    </div>
  );
}
