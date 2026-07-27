import { useState } from 'react';
import { destinations } from '../data/destinations';
import { planTrips } from '../domain/planTrips';

const twd = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
});

export function App() {
  const [budget, setBudget] = useState('');
  const [vacationDays, setVacationDays] = useState('');

  const budgetValue = Number(budget);
  const vacationDaysValue = Number(vacationDays);
  const ready = budgetValue > 0 && vacationDaysValue > 0;

  const plans = ready
    ? planTrips({ budget: budgetValue, vacationDays: vacationDaysValue }, destinations)
    : [];

  return (
    <main>
      <h1>現在能去哪</h1>
      <p className="lede">輸入你的預算和假期，看看現在去得起哪些國家。</p>

      <form onSubmit={(event) => event.preventDefault()}>
        <label>
          預算（TWD）
          <input
            type="number"
            inputMode="numeric"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="50000"
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

      {ready && (
        <section>
          <h2>你去得起</h2>
          <ul className="plans">
            {plans.map((plan) => (
              <li key={plan.destination.id}>
                <span className="name">{plan.destination.name}</span>
                <span className="cost">{twd.format(plan.tripCost)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
