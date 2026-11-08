import { Fragment, useMemo, type CSSProperties } from "react";
import type { AnnotatedDocument } from "../types";
import { tokenize } from "./tokenize";
import { entitiesAt } from "./spans";
import { FALLBACK_COLOR } from "./colors";
import "./AnnotatedText.css";

interface Props {
  doc: AnnotatedDocument;
  typeColors: Record<string, string>;
}

/**
 * Version 1 of the display: every word is its own <span> carrying its
 * character offsets (data-start / data-end). Person B reads those attributes
 * to turn a mouse selection into offsets.
 *
 * Words are colored by the FIRST entity covering them. Words in two or more
 * entities get a dotted outline as a reminder that they need the stacked
 * underlines from step 3 (assignLanes).
 */
export function AnnotatedText({ doc, typeColors }: Props) {
  const tokens = useMemo(() => tokenize(doc.text), [doc.text]);

  return (
    <div className="annotated-text">
      {tokens.map((tok, i) => {
        // Copy the whitespace between tokens from the original text.
        const gap = doc.text.slice(i === 0 ? 0 : tokens[i - 1].end, tok.start);
        const covering = entitiesAt(tok, doc.entities);
        const first = covering[0];
        const color = first ? (typeColors[first.type] ?? FALLBACK_COLOR) : undefined;
        const className = [
          "token",
          first && "annotated",
          covering.length > 1 && "overlap",
        ].filter(Boolean).join(" ");

        return (
          <Fragment key={tok.start}>
            {gap}
            <span
              className={className}
              data-start={tok.start}
              data-end={tok.end}
              data-entities={covering.length ? covering.map((e) => e.id).join(" ") : undefined}
              title={covering.length ? covering.map((e) => `${e.id} (${e.type})`).join(", ") : undefined}
              style={color ? ({ "--entity-color": color } as CSSProperties) : undefined}
            >
              {tok.text}
            </span>
          </Fragment>
        );
      })}
      {doc.text.slice(tokens.length ? tokens[tokens.length - 1].end : 0)}
    </div>
  );
}
