export type Tone = 'affordable' | 'shortfall' | 'estimate' | 'idle';

export type TripRow = {
  id: string;
  name: string;
  tone: Tone;
  /** 右邊那欄：金額、還差多少，或最少要幾天 */
  value: string;
};

type Props = {
  rows: TripRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** 一行一個地方：左邊的燈號對應地球上的顏色，名字和金額之間拉一條點線。 */
export function TripList({ rows, selectedId, onSelect }: Props) {
  if (rows.length === 0) return null;

  return (
    <ul className="trips">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            className={`trip ${row.tone}`}
            aria-pressed={row.id === selectedId}
            onClick={() => onSelect(row.id)}
          >
            <span className="lamp" aria-hidden="true" />
            <span className="trip-name">{row.name}</span>
            <span className="leader" aria-hidden="true" />
            <span className="trip-value">{row.value}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
