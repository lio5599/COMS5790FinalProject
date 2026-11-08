import type { AnnotatedDocument } from "../types";
import { entityText, sortEntities } from "./spans";
import { FALLBACK_COLOR } from "./colors";
import "./EntityList.css";

interface Props {
  doc: AnnotatedDocument;
  typeColors: Record<string, string>;
  /** Entity ids to emphasize (the same ones highlighted in the text). */
  highlighted?: string[];
  /** Called when the pointer (or keyboard focus) moves onto an entry. [] means none. */
  onEntityHover?: (ids: string[]) => void;
  /** Called when an entry is clicked, with that one entity: ["T2"]. */
  onEntityClick?: (ids: string[]) => void;
}

/**
 * Side panel listing every entity in reading order: its label
 * ("muscle … fatigue"), type, and number of fragments. Hovering an entry
 * highlights it in the text; clicking one selects it and scrolls to it.
 */
export function EntityList({ doc, typeColors, highlighted, onEntityHover, onEntityClick }: Props) {
  const entities = sortEntities(doc.entities);
  const hl = new Set(highlighted ?? []);

  return (
    <aside className="entity-list" onMouseLeave={() => onEntityHover?.([])}>
      <h2>
        Entities <span className="entity-count">{entities.length}</span>
      </h2>
      {entities.length === 0 ? (
        <p className="entity-empty">No entities yet. Select words in the text to add one.</p>
      ) : (
        <ul>
          {entities.map((e) => {
            const n = e.spans.length;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className={hl.has(e.id) ? "entity-row hl" : "entity-row"}
                  onMouseEnter={() => onEntityHover?.([e.id])}
                  onFocus={() => onEntityHover?.([e.id])}
                  onBlur={() => onEntityHover?.([])}
                  onClick={() => onEntityClick?.([e.id])}
                >
                  <span className="entity-dot" style={{ background: typeColors[e.type] ?? FALLBACK_COLOR }} />
                  <span className="entity-label">{entityText(doc.text, e)}</span>
                  <span className="entity-meta">
                    {e.type} · {n} {n === 1 ? "fragment" : "fragments"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
