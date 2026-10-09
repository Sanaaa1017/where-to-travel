import { useMemo, useState } from 'react';
import { destinations } from '../data/destinations';
import { planTrips } from '../domain/planTrips';
import type { TripPlan } from '../domain/types';
import { GlobeView } from './globe/GlobeView';
import { formatTwd } from './money';

export function App() {
  const [budget, setBudget] = useState('');
  const [vacationDays, setVacationDays] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const budgetValue = Number(budget);
  const vacationDaysValue = Number(vacationDays);
  const ready = budgetValue > 0 && vacationDaysValue > 0;

  // 只在輸入改變時重算：地球靠陣列是不是同一個來判斷航線要不要重畫。
  const plans = useMemo(
    () =>
      ready
        ? planTrips({ budget: budgetValue, vacationDays: vacationDaysValue }, destinations)
        : [],
    [ready, budgetValue, vacationDaysValue],
  );
  const affordable = plans.filter((plan) => plan.status === 'affordable');
  const shortfall = plans.filter((plan) => plan.status === 'shortfall');

  return (
    <div className="app">
      <header className="ask">
        <h1 className="brand">現在能去哪</h1>
        {/* 兩個輸入欄就是 Traveler 對自己說的一句話。 */}
        <form onSubmit={(event) => event.preventDefault()}>
          <p className="ask-line">
            我有
            <InlineNumber
              label="預算（新台幣元）"
              value={budget}
              placeholder="80000"
              onChange={setBudget}
            />
            元，
          </p>
          <p className="ask-line">
            還有
            <InlineNumber
              label="假期天數"
              value={vacationDays}
              placeholder="7"
              onChange={setVacationDays}
            />
            天假。
          </p>
        </form>
      </header>

      <GlobeView plans={plans} focusedId={focusedId} onSelect={setFocusedId} />

      <section className="answer">
        <div aria-live="polite">
          {!ready ? (
            <p className="reply quiet">填好這兩個數字，去得起的國家會在地球上亮起來。</p>
          ) : plans.length === 0 ? (
            <p className="reply quiet">這幾天假還不夠飛到任何地方。多請幾天，選擇就會出現。</p>
          ) : affordable.length > 0 ? (
            <h2 className="reply">現在就能去 {affordable.length} 個國家。</h2>
          ) : (
            <h2 className="reply quiet">現在的錢還不夠，不過有幾個地方只差一點。</h2>
          )}
        </div>

        <TripList plans={affordable} focusedId={focusedId} onSelect={setFocusedId} />

        {shortfall.length > 0 && (
          <>
            <h2 className="later">再存一點就能去</h2>
            <TripList plans={shortfall} focusedId={focusedId} onSelect={setFocusedId} />
          </>
        )}

        {plans.length > 0 && <p className="footnote">以一個人、一般價格估算，不是即時票價。</p>}
      </section>
    </div>
  );
}

type InlineNumberProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/** 嵌在句子裡的數字欄：只收數字，寬度跟著內容長。 */
function InlineNumber({ label, value, placeholder, onChange }: InlineNumberProps) {
  return (
    <input
      className="inline-number"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      style={{ width: `${Math.max(value.length, placeholder.length) + 0.6}ch` }}
    />
  );
}

type TripListProps = {
  plans: TripPlan[];
  focusedId: string | null;
  onSelect: (id: string) => void;
};

function TripList({ plans, focusedId, onSelect }: TripListProps) {
  if (plans.length === 0) return null;

  return (
    <ul className="trips">
      {plans.map((plan) => (
        <li key={plan.destination.id}>
          <button
            type="button"
            className={`trip ${plan.status}`}
            aria-pressed={plan.destination.id === focusedId}
            onClick={() => onSelect(plan.destination.id)}
          >
            <span className="lamp" aria-hidden="true" />
            <span className="trip-name">{plan.destination.name}</span>
            <span className="leader" aria-hidden="true" />
            <span className="trip-cost">
              {plan.status === 'affordable'
                ? formatTwd(plan.tripCost)
                : `還差 ${formatTwd(plan.shortfall)}`}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
