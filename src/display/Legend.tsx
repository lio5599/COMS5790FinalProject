interface Props {
  typeColors: Record<string, string>;
}

export function Legend({ typeColors }: Props) {
  return (
    <ul className="legend">
      {Object.entries(typeColors).map(([type, color]) => (
        <li key={type}>
          <span className="legend-dot" style={{ background: color }} />
          {type}
        </li>
      ))}
    </ul>
  );
}
