import { useState } from "react";
import { AnnotatedText } from "./display/AnnotatedText";
import { Legend } from "./display/Legend";
import { TYPE_COLORS } from "./display/colors";
import { SAMPLE_DOCS } from "./data/samples";

export default function App() {
  const [index, setIndex] = useState(0);
  const doc = SAMPLE_DOCS[index];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Discontinuous NER annotator</h1>
        <label>
          Sample document{" "}
          <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
            {SAMPLE_DOCS.map((d, i) => (
              <option key={d.id} value={i}>
                {d.id}
              </option>
            ))}
          </select>
        </label>
      </header>
      <Legend typeColors={TYPE_COLORS} />
      <AnnotatedText doc={doc} typeColors={TYPE_COLORS} />
    </main>
  );
}
