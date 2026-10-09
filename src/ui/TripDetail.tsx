import { estimateTrip, minimumStayOf } from '../domain/planTrips';
import type {
  CostBreakdown,
  Demand,
  Destination,
  Season,
  SpendLevel,
  TravelStyle,
} from '../domain/types';
import { Segmented, Stepper } from './controls';
import { CATEGORIES, LEVEL_LABELS, SEASONS, joinWithAnd, seasonLabel } from './labels';
import { formatTwd } from './money';

const DEMAND_LABELS: Record<Demand, string> = {
  low: 'low season',
  shoulder: 'regular season',
  peak: 'peak season',
};

const SEASON_OPTIONS: { value: Season | 'any'; label: string }[] = [
  { value: 'any', label: 'Any' },
  ...SEASONS.map(({ value, label }) => ({ value, label })),
];

/** 可以調整程度的三項；機票和交通沒有選項。 */
const ADJUSTABLE: Partial<Record<keyof CostBreakdown, keyof TravelStyle>> = {
  accommodation: 'stay',
  food: 'food',
  activities: 'activities',
};

type Props = {
  selectedId: string | null;
  name: string;
  destination: Destination | undefined;
  /** 0 表示 Traveler 還沒填天數 */
  vacationDays: number;
  season: Season | null;
  style: TravelStyle;
  budget: number | null;
  onDaysChange: (days: number) => void;
  onSeasonChange: (season: Season | null) => void;
  onStyleChange: (style: TravelStyle) => void;
  /** 把這趟的估算當成 Budget，連同估算用的天數一起帶回上面那句話。 */
  onUseAsBudget: (amount: number, days: number) => void;
  onClose: () => void;
};

export function TripDetail(props: Props) {
  const { selectedId, name, destination, onClose } = props;

  if (!selectedId) {
    return (
      <div className="detail-empty">
        <h2>What would a trip cost?</h2>
        <p>
          Pick a country on the globe or from the list. You'll see flights, stay, food and
          activities added up, and you can adjust each one.
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="detail-head">
        <h2 id="detail-title">{name}</h2>
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      {destination ? (
        <Estimate {...props} destination={destination} />
      ) : (
        <p className="detail-note">
          {selectedId === 'CN-TW'
            ? 'Every trip here starts from Taipei. Pick somewhere abroad.'
            : `We don't have estimates for ${name} yet.`}
        </p>
      )}
    </>
  );
}

function Estimate({
  destination,
  vacationDays,
  season,
  style,
  budget,
  onDaysChange,
  onSeasonChange,
  onStyleChange,
  onUseAsBudget,
}: Props & { destination: Destination }) {
  const minimumStay = minimumStayOf(destination);
  // 還沒填天數時先用一週估算，太遠的地方則用它的 Minimum Stay。
  const days = vacationDays > 0 ? vacationDays : Math.max(7, minimumStay);
  const { breakdown, tripCost } = estimateTrip(destination, { vacationDays: days, season, style });

  const peaks = seasonsWith(destination, 'peak');
  const lows = seasonsWith(destination, 'low');
  const seasonNote = [
    peaks.length > 0 && `Busiest in ${joinWithAnd(peaks)}.`,
    lows.length > 0 && `Cheapest in ${joinWithAnd(lows)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const detailOf = (key: keyof CostBreakdown) => {
    if (key === 'flight') {
      return season
        ? `Round trip, ${DEMAND_LABELS[destination.seasons[season]]}`
        : 'Round trip, economy';
    }
    const unit = key === 'accommodation' ? 'night' : 'day';
    return `${days} ${unit}${days === 1 ? '' : 's'} × ${formatTwd(breakdown[key] / days)}`;
  };

  return (
    <>
      <p className="detail-meta">
        {formatHours(destination.flightHours)} flight from Taipei. Worth at least {minimumStay}{' '}
        days.
      </p>

      <div className="field">
        <span className="field-label">Trip length</span>
        <Stepper
          label="Trip length"
          value={days}
          unit="days"
          min={1}
          max={60}
          onChange={onDaysChange}
        />
      </div>

      <div className="field">
        <span className="field-label">When</span>
        <Segmented
          legend="Season"
          options={SEASON_OPTIONS}
          value={season ?? 'any'}
          onChange={(value) => onSeasonChange(value === 'any' ? null : value)}
        />
        {seasonNote && <p className="field-note">{seasonNote}</p>}
      </div>

      {days < minimumStay && (
        <div className="notice">
          <p>
            It's a {formatHours(destination.flightHours)} flight each way, so {destination.name} is
            worth at least {minimumStay} days.
          </p>
          <button type="button" className="text-button" onClick={() => onDaysChange(minimumStay)}>
            Make it {minimumStay} days
          </button>
        </div>
      )}

      <section className="costs" aria-labelledby="estimate-total">
        <p className="total-label" id="estimate-total">
          Estimated total for one person
        </p>
        <p className="total">{formatTwd(tripCost)}</p>

        <BreakdownBar breakdown={breakdown} total={tripCost} />

        <ul className="lines">
          {CATEGORIES.map(({ key, label, color }) => {
            const styleKey = ADJUSTABLE[key];
            return (
              <li key={key} className="line">
                <span className="swatch" style={{ background: color }} aria-hidden="true" />
                <span className="line-label">{label}</span>
                <span className="line-amount">{formatTwd(breakdown[key])}</span>
                <span className="line-detail">{detailOf(key)}</span>
                <span className="line-share">{shareOf(breakdown[key], tripCost)}</span>
                {styleKey && (
                  <div className="line-control">
                    <Segmented<SpendLevel>
                      legend={`${label} level`}
                      options={(['save', 'standard', 'splurge'] as const).map((level) => ({
                        value: level,
                        label: LEVEL_LABELS[styleKey][level],
                      }))}
                      value={style[styleKey]}
                      onChange={(level) => onStyleChange({ ...style, [styleKey]: level })}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <Verdict
          tripCost={tripCost}
          budget={budget}
          onUseAsBudget={(amount) => onUseAsBudget(amount, days)}
        />
      </section>

      <p className="disclaimer">
        Typical prices for one person, in TWD. These aren't live quotes, and visa or entry fees
        aren't included.
      </p>
    </>
  );
}

function BreakdownBar({ breakdown, total }: { breakdown: CostBreakdown; total: number }) {
  return (
    <div className="bar" aria-hidden="true">
      {CATEGORIES.map(({ key, label, color }) => (
        <span
          key={key}
          className="bar-segment"
          style={{ flexGrow: breakdown[key], background: color }}
          title={`${label}: ${formatTwd(breakdown[key])} (${shareOf(breakdown[key], total)})`}
        />
      ))}
    </div>
  );
}

type VerdictProps = {
  tripCost: number;
  budget: number | null;
  onUseAsBudget: (amount: number) => void;
};

function Verdict({ tripCost, budget, onUseAsBudget }: VerdictProps) {
  if (budget === null) {
    return (
      <div className="verdict">
        <button type="button" className="primary-button" onClick={() => onUseAsBudget(tripCost)}>
          Use {formatTwd(tripCost)} as my budget
        </button>
        <p className="verdict-hint">You'll see every other place that fits it.</p>
      </div>
    );
  }

  const spare = budget - tripCost;
  return (
    <p className={`verdict ${spare >= 0 ? 'affordable' : 'shortfall'}`}>
      <span className="lamp" aria-hidden="true" />
      {spare > 0
        ? `Fits your budget, with ${formatTwd(spare)} to spare.`
        : spare === 0
          ? 'Fits your budget exactly.'
          : `${formatTwd(-spare)} more than your budget.`}
    </p>
  );
}

function seasonsWith(destination: Destination, demand: Demand): string[] {
  return SEASONS.filter(({ value }) => destination.seasons[value] === demand).map(({ value }) =>
    seasonLabel(value).toLowerCase(),
  );
}

function shareOf(part: number, total: number): string {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : '0%';
}

function formatHours(hours: number): string {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return minutes > 0 ? `${whole} h ${minutes} min` : `${whole} h`;
}
