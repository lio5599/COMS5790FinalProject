import { useState } from "react";
import type { Span } from "./types";
import { AnnotatedText } from "./display/AnnotatedText";
import { EntityList } from "./display/EntityList";
import { Legend } from "./display/Legend";
import { TYPE_COLORS } from "./display/colors";
import { entityText } from "./display/spans";
import { SAMPLE_DOCS } from "./data/samples";

export default function App() {
  const [index, setIndex] = useState(0);
  const doc = SAMPLE_DOCS[index];

  // Shared by the text and the entity list, so they stay in sync.
  const [hovered, setHovered] = useState<string[]>([]); // under the pointer right now
  const [selected, setSelected] = useState<string[]>([]); // last clicked (Person B's edit menu will use this)
  const [scrollTo, setScrollTo] = useState<{ id: string } | null>(null);
  const highlighted = hovered.length ? hovered : selected;

  // Preview of the in-progress outline. Once Person B's code exists, B's
  // state (the fragments selected so far) replaces this.
  const [previewPending, setPreviewPending] = useState(false);
  const pendingSpans: Span[] = previewPending && doc.entities.length ? [doc.entities[0].spans[0]] : [];

  function switchDocument(i: number) {
    setIndex(i);
    setHovered([]);
    setSelected([]);
  }

  const selectedEntities = doc.entities.filter((e) => selected.includes(e.id));

  return (
    <main className="app">
      <header className="app-header">
        <h1>Discontinuous NER annotator</h1>
        <label>
          Sample document{" "}
          <select value={index} onChange={(e) => switchDocument(Number(e.target.value))}>
            {SAMPLE_DOCS.map((d, i) => (
              <option key={d.id} value={i}>
                {d.id}
              </option>
            ))}
          </select>
        </label>
      </header>
      <Legend typeColors={TYPE_COLORS} />

      <div className="workspace">
        <section>
          <AnnotatedText
            doc={doc}
            typeColors={TYPE_COLORS}
            highlighted={highlighted}
            pendingSpans={pendingSpans}
            onEntityHover={setHovered}
            onEntityClick={setSelected}
            scrollTo={scrollTo}
          />
        </section>
        <EntityList
          doc={doc}
          typeColors={TYPE_COLORS}
          highlighted={highlighted}
          onEntityHover={setHovered}
          onEntityClick={(ids) => {
            setSelected(ids);
            setScrollTo({ id: ids[0] });
          }}
        />
      </div>

      {/* Development panel: shows what the display reports, for testing and for Person B. */}
      <footer className="dev-panel">
        <span>
          <strong>Selected:</strong>{" "}
          {selectedEntities.length
            ? selectedEntities.map((e) => `${e.id} "${entityText(doc.text, e)}"`).join(", ")
            : "nothing (click an underline, a word, or an entry in the list)"}
        </span>
        <label>
          <input
            type="checkbox"
            checked={previewPending}
            onChange={(e) => setPreviewPending(e.target.checked)}
          />{" "}
          Preview in-progress outline
        </label>
      </footer>
    </main>
  );
}
