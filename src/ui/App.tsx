import { useState } from 'react';
import { destinations } from '../data/destinations';
import { planTrips } from '../domain/planTrips';
import { GlobeView } from './globe/GlobeView';

const twd = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
});

export function App() {
  const [budget, setBudget] = useState('');
  const [vacationDays, setVacationDays] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const budgetValue = Number(budget);
  const vacationDaysValue = Number(vacationDays);
  const ready = budgetValue > 0 && vacationDaysValue > 0;

  const plans = ready
    ? planTrips({ budget: budgetValue, vacationDays: vacationDaysValue }, destinations)
    : [];
  const affordable = plans.filter((plan) => plan.status === 'affordable');
  const shortfall = plans.filter((plan) => plan.status === 'shortfall');

  return (
    <div className="app">
      <GlobeView plans={plans} focusedId={focusedId} onSelect={setFocusedId} />

      <section className="panel controls">
        <h1>現在能去哪</h1>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            預算（TWD）
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="80000"
            />
          </label>

          <label>
            假期（天）
            <input
              type="number"
              inputMode="numeric"
              value={vacationDays}
              onChange={(event) => setVacationDays(event.target.value)}
              placeholder="7"
            />
          </label>
        </form>
      </section>

      <aside className="panel results">
        {!ready ? (
          <p className="hint">填上預算和假期，去得起的國家會在地球上亮起來。</p>
        ) : (
          <>
            <h2 className="tally">
              你去得起 <strong>{affordable.length}</strong> 個國家
            </h2>

            <ul className="plans">
              {affordable.map((plan) => (
                <li key={plan.destination.id}>
                  <button
                    type="button"
                    className={plan.destination.id === focusedId ? 'focused' : undefined}
                    onClick={() => setFocusedId(plan.destination.id)}
                  >
                    <span className="name">{plan.destination.name}</span>
                    <span className="cost">{twd.format(plan.tripCost)}</span>
                  </button>
                </li>
              ))}
            </ul>

            {shortfall.length > 0 && (
              <>
                <h2 className="tally muted">再存一點就能去</h2>
                <ul className="plans muted">
                  {shortfall.map((plan) => (
                    <li key={plan.destination.id}>
                      <button
                        type="button"
                        className={plan.destination.id === focusedId ? 'focused' : undefined}
                        onClick={() => setFocusedId(plan.destination.id)}
                      >
                        <span className="name">{plan.destination.name}</span>
                        <span className="cost">還差 {twd.format(plan.shortfall)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {plans.length === 0 && (
              <p className="hint">這些假期天數還不夠飛到任何一個地方——多請幾天，選擇就會出現。</p>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
