import { useEffect, useMemo, useRef, useState } from 'react';
import { destinations } from '../data/destinations';
import { estimateTrips, minimumStayOf, planTrips, standardStyle } from '../domain/planTrips';
import type { Season, TravelStyle } from '../domain/types';
import { InlineNumber } from './controls';
import { GlobeView, type GlobeMark } from './globe/GlobeView';
import { assumptionsOf, joinWithAnd } from './labels';
import { formatTwd } from './money';
import { regionName } from './regionName';
import { TripDetail } from './TripDetail';
import { TripList, type TripRow } from './TripList';

const destinationById = new Map(destinations.map((destination) => [destination.id, destination]));
const shortestStay = Math.min(...destinations.map(minimumStayOf));

export function App() {
  const [budget, setBudget] = useState('');
  const [vacationDays, setVacationDays] = useState('');
  const [season, setSeason] = useState<Season | null>(null);
  const [style, setStyle] = useState<TravelStyle>(standardStyle);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const budgetValue = Number(budget);
  const days = Number(vacationDays);
  const hasBudget = budgetValue > 0;
  const hasDays = days > 0;

  // 有 Budget 就跟 Budget 比；還沒決定 Budget 時，只列出每個地方大概要多少。
  const plans = useMemo(
    () =>
      hasBudget && hasDays
        ? planTrips({ budget: budgetValue, vacationDays: days, season, style }, destinations)
        : [],
    [hasBudget, hasDays, budgetValue, days, season, style],
  );
  const estimates = useMemo(
    () =>
      !hasBudget && hasDays
        ? estimateTrips({ vacationDays: days, season, style }, destinations)
        : [],
    [hasBudget, hasDays, days, season, style],
  );
  const tooShort = useMemo(
    () =>
      hasDays
        ? destinations
            .filter((destination) => minimumStayOf(destination) > days)
            .sort((a, b) => minimumStayOf(a) - minimumStayOf(b) || a.name.localeCompare(b.name))
        : [],
    [hasDays, days],
  );

  const affordableRows: TripRow[] = plans
    .filter((plan) => plan.status === 'affordable')
    .map((plan) => ({
      id: plan.destination.id,
      name: plan.destination.name,
      tone: 'affordable',
      value: formatTwd(plan.tripCost),
    }));
  const shortfallRows: TripRow[] = plans
    .filter((plan) => plan.status === 'shortfall')
    .map((plan) => ({
      id: plan.destination.id,
      name: plan.destination.name,
      tone: 'shortfall',
      value: `${formatTwd(plan.shortfall)} short`,
    }));
  const estimateRows: TripRow[] = estimates.map((estimate) => ({
    id: estimate.destination.id,
    name: estimate.destination.name,
    tone: 'estimate',
    value: formatTwd(estimate.tripCost),
  }));
  const tooShortRows: TripRow[] = tooShort.map((destination) => ({
    id: destination.id,
    name: destination.name,
    tone: 'idle',
    value: `${minimumStayOf(destination)}+ days`,
  }));

  const marks = useMemo(() => {
    const byId = new Map<string, GlobeMark>();
    for (const destination of destinations) {
      const minimumStay = minimumStayOf(destination);
      byId.set(destination.id, {
        id: destination.id,
        name: destination.name,
        tone: 'idle',
        note:
          hasDays && minimumStay > days ? `Needs ${minimumStay}+ days` : 'Click to price a trip',
      });
    }
    for (const plan of plans) {
      const { id, name } = plan.destination;
      byId.set(id, {
        id,
        name,
        tone: plan.status,
        note:
          plan.status === 'affordable'
            ? `${formatTwd(plan.tripCost)}, fits your budget`
            : `${formatTwd(plan.shortfall)} short`,
      });
    }
    for (const estimate of estimates) {
      const { id, name } = estimate.destination;
      byId.set(id, {
        id,
        name,
        tone: 'estimate',
        note: `About ${formatTwd(estimate.tripCost)} for ${days} days`,
      });
    }
    return [...byId.values()];
  }, [plans, estimates, hasDays, days]);

  const reply = replyOf({
    hasBudget,
    hasDays,
    days,
    affordable: affordableRows.length,
    listed: plans.length + estimates.length,
  });
  const assumptions = assumptionsOf(season, style);

  // 換一個地方時，明細從頭看起；手機上明細在地球下方，捲過去讓 Traveler 看得到。
  const detail = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = detail.current;
    if (!element || !selectedId) return;
    element.scrollTop = 0;
    if (window.matchMedia('(max-width: 1099px)').matches) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    }
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedId]);

  const selected = selectedId ? destinationById.get(selectedId) : undefined;

  return (
    <div className="app">
      <header className="ask">
        <h1 className="brand">Where can I go?</h1>
        {/* 兩個輸入欄就是 Traveler 對自己說的一句話。 */}
        <form className="sentence" onSubmit={(event) => event.preventDefault()}>
          I have NT$
          <InlineNumber
            label="Budget in New Taiwan dollars"
            value={budget}
            placeholder="80,000"
            onChange={setBudget}
            grouped
          />
          and
          <InlineNumber
            label="Days off"
            value={vacationDays}
            placeholder="7"
            onChange={setVacationDays}
          />
          days off.
        </form>
      </header>

      <GlobeView marks={marks} selectedId={selectedId} onSelect={setSelectedId} />

      <aside
        ref={detail}
        className={selectedId ? 'detail' : 'detail is-empty'}
        aria-labelledby={selectedId ? 'detail-title' : undefined}
      >
        <TripDetail
          selectedId={selectedId}
          name={selected?.name ?? (selectedId ? regionName(selectedId, selectedId) : '')}
          destination={selected}
          vacationDays={days}
          season={season}
          style={style}
          budget={hasBudget ? budgetValue : null}
          onDaysChange={(next) => setVacationDays(String(next))}
          onSeasonChange={setSeason}
          onStyleChange={setStyle}
          onUseAsBudget={(amount, tripDays) => {
            setBudget(String(amount));
            setVacationDays(String(tripDays));
          }}
          onClose={() => setSelectedId(null)}
        />
      </aside>

      <section className="results" aria-label="Places">
        <div aria-live="polite">
          <p className={`reply ${reply.tone}`}>{reply.text}</p>
        </div>

        {assumptions.length > 0 && hasDays && (
          <p className="assumptions">
            Priced for {joinWithAnd(assumptions)}.{' '}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSeason(null);
                setStyle(standardStyle);
              }}
            >
              Reset
            </button>
          </p>
        )}

        <TripList rows={affordableRows} selectedId={selectedId} onSelect={setSelectedId} />
        <TripList rows={estimateRows} selectedId={selectedId} onSelect={setSelectedId} />

        {shortfallRows.length > 0 && (
          <>
            <h2 className="group-title">Save a bit more</h2>
            <TripList rows={shortfallRows} selectedId={selectedId} onSelect={setSelectedId} />
          </>
        )}

        {tooShortRows.length > 0 && (
          <>
            <h2 className="group-title muted">Need more days</h2>
            <TripList rows={tooShortRows} selectedId={selectedId} onSelect={setSelectedId} />
          </>
        )}

        {plans.length + estimates.length > 0 && (
          <p className="footnote">
            Typical prices for one person, in TWD. Not live quotes, and visa or entry fees aren't
            included.
          </p>
        )}
      </section>
    </div>
  );
}

type ReplyInput = {
  hasBudget: boolean;
  hasDays: boolean;
  days: number;
  affordable: number;
  listed: number;
};

/** 清單上方那一句話：先回答 Traveler 最想知道的事，零結果時說清楚是錢還是天數的問題。 */
function replyOf({ hasBudget, hasDays, days, affordable, listed }: ReplyInput): {
  text: string;
  tone: 'lit' | 'plain' | 'quiet';
} {
  if (!hasDays) {
    return hasBudget
      ? { text: 'How many days off do you have?', tone: 'quiet' }
      : {
          text: 'Fill in both, or click any country on the globe to price a trip there.',
          tone: 'quiet',
        };
  }
  if (listed === 0) {
    return {
      text: `${days} ${days === 1 ? 'day is' : 'days are'} too short for a trip abroad. With ${shortestStay} days off, places nearby open up.`,
      tone: 'quiet',
    };
  }
  if (!hasBudget) {
    return {
      text: `${listed} places fit ${days} days. Here's roughly what each costs.`,
      tone: 'plain',
    };
  }
  if (affordable > 0) {
    return {
      text: `You can go to ${affordable} ${affordable === 1 ? 'place' : 'places'} right now.`,
      tone: 'lit',
    };
  }
  return { text: "Nothing fits yet, but these places aren't far off.", tone: 'quiet' };
}
