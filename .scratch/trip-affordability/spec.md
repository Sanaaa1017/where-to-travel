# Spec: Trip Affordability

Status: ready-for-agent

## Problem Statement

我很想出國，但每次一動念頭就卡住。

我不知道自己到底走不走得了。要多少錢？我手上這點假期夠嗎？想查清楚，就得打開一堆比價網站、輸入根本還沒想好的日期、比對飯店價格——光是想到這些準備工作就累了，於是又把念頭收回去。這件事就這樣一年一年拖著。

我要的其實不是最便宜的機票。我要的是有人直接告訴我：**以我現在的錢和假，我到底能去哪裡。** 如果哪裡去不了，我也想知道**還差多少**——這樣至少那個念頭有個具體的形狀，而不是一團「大概不行吧」的模糊焦慮。

## Solution

一個網頁，只有兩個輸入欄位：**Budget** 和 **Vacation Days**。

填完，立刻得到一份清單，分成兩區：

- **你去得起** — Trip Cost 沒超過 Budget 的 Destination，預算內最貴的排最前面。第一眼看到的是「以你的條件能去的最好的地方」，不是「你只配去的地方」。
- **再存一點就能去** — Trip Cost 超過 Budget 的 Destination，附上 Shortfall（還差多少），差最少的排最前面。

不問出發日期（見 ADR-0001）。不需要註冊。不用等載入。假期不夠去的地方不會出現，所以清單上每一個都是真的可以走的。

## User Stories

1. As a Traveler, I want to enter a single Budget number, so that I don't have to itemise a plan I haven't made yet.
2. As a Traveler, I want to enter my Vacation Days, so that the answer reflects the time I actually have, not an imaginary two-week holiday.
3. As a Traveler, I want results the moment both inputs are filled, so that nothing stands between the impulse and the answer.
4. As a Traveler, I want to never be asked for a departure date, so that I don't have to make a decision I'm not ready to make just to get an estimate.
5. As a Traveler, I want to see which Destinations are Affordable, so that I know going is actually possible.
6. As a Traveler, I want the most expensive Affordable Destination shown first, so that the first thing I see is the best trip within my reach.
7. As a Traveler, I want to see Destinations that aren't Affordable too, so that the places I actually dream about don't silently vanish from the list.
8. As a Traveler, I want each unaffordable Destination to show its Shortfall, so that "I can't afford it" becomes a specific number I could save toward.
9. As a Traveler, I want the smallest Shortfall shown first, so that the nearly-reachable trips are the most visible.
10. As a Traveler, I want Affordable and Shortfall Destinations visually separated, so that I can tell at a glance which is which without reading numbers.
11. As a Traveler, I want Destinations that need more days than I have to be hidden entirely, so that I'm never advised to fly 30 hours for a 3-day trip.
12. As a Traveler, I want to see the Trip Cost broken into Flight Cost, Accommodation Cost and Daily Spend, so that I can sanity-check the estimate against what I know.
13. As a Traveler, I want to be told these are typical estimates and not bookable prices, so that I don't feel misled when real prices differ.
14. As a Traveler, I want all amounts in TWD, so that I don't have to convert anything in my head.
15. As a Traveler, I want to know the estimate is for one person, so that I understand what I'm looking at.
16. As a Traveler, I want to change my Budget and see the list rearrange immediately, so that I can explore "what if I saved another 10k".
17. As a Traveler, I want to change my Vacation Days and see Destinations appear or disappear, so that I can see what taking more leave would unlock.
18. As a Traveler whose Budget affords nothing, I want an honest, non-punishing message instead of a blank screen, so that I don't feel judged.
19. As a Traveler whose Vacation Days are too few for any Destination, I want to be told that days — not money — are the binding constraint, so that I know which problem to solve.
20. As a Traveler, I want to see how many days a Destination needs at minimum, so that I understand why some options are missing.
21. As a Traveler, I want empty or not-yet-filled inputs to show no results rather than an error, so that the page feels calm before I've typed anything.
22. As a Traveler, I want zero or negative input to be rejected clearly, so that I'm not shown nonsense results.
23. As a Traveler, I want the page to work without an account or any saved data, so that I can check on impulse and close the tab.
24. As a Traveler, I want results to appear without a network request, so that it never feels like "searching".
25. As a Traveler on a phone, I want the list readable on a small screen, so that I can check this in bed at 1am, which is when I actually think about this.

## Implementation Decisions

### Modules

- **Domain module** — pure TypeScript, no React import anywhere in it. This is a precondition of ADR-0002, not a nicety. It owns the `Destination` and `TripPlan` types and the `planTrips` function.
- **Destination dataset** — a static, hand-curated TypeScript/JSON module. Committed to the repo. No network fetch at runtime (ADR-0001 means there is nothing live to fetch).
- **UI layer** — React, deliberately thin. Reads the two inputs, calls `planTrips`, renders the two sections. No domain logic.

### The single public interface

```ts
type Destination = {
  id: string                    // ISO-ish country code, e.g. 'JP'
  name: string                  // display name, zh-TW
  flightCost: number            // round trip from Taiwan, TWD
  nightlyAccommodation: number  // TWD per night
  dailySpend: number            // TWD per day, excluding accommodation
  flightHours: number           // one-way, used to derive Minimum Stay
}

type TripPlan = {
  destination: Destination
  tripCost: number
  status: 'affordable' | 'shortfall'
  shortfall: number             // 0 when affordable
}

function planTrips(
  input: { budget: number; vacationDays: number },
  destinations: Destination[],
): TripPlan[]
```

`destinations` is a **parameter, not an import**. This is what keeps the seam testable without depending on the real dataset.

### Trip Cost formula

For one Traveler:

```
tripCost = flightCost
         + nightlyAccommodation × vacationDays
         + dailySpend × vacationDays
```

Nights are treated as equal to Vacation Days. This slightly over-estimates (a 5-day trip is arguably 4 nights), and that is deliberate: over-estimating is the safe direction for a product whose job is to stop people from being caught short.

### Minimum Stay rule

Derived from `flightHours`, not stored per Destination:

| One-way flight time | Minimum Stay |
| ------------------- | ------------ |
| < 4 h               | 3 days       |
| 4–10 h              | 5 days       |
| > 10 h              | 8 days       |

A Destination whose Minimum Stay exceeds `vacationDays` is **excluded from the output entirely** — it does not appear in either section.

### Ordering

`planTrips` returns a single array, already ordered for display:

1. All `affordable` plans first, sorted by `tripCost` **descending** (closest to Budget first).
2. Then all `shortfall` plans, sorted by `shortfall` **ascending** (nearest to reachable first).

Ties broken by `destination.name` for deterministic output — tests depend on a stable order.

### Input handling

- Both inputs empty / not yet valid → the UI renders no results and no error. `planTrips` is simply not called.
- Budget ≤ 0 or Vacation Days ≤ 0 → treated as invalid input by the UI; `planTrips` is not called.
- Vacation Days is a whole number of days.

### Dataset scope

Roughly 20 Destinations for the first version, chosen as the countries Taiwanese travellers actually go to: 日本、韓國、香港、泰國、越南、新加坡、馬來西亞、菲律賓、印尼、美國、加拿大、澳洲、紐西蘭、英國、法國、德國、義大利、西班牙、荷蘭、土耳其.

Numbers are typical/representative figures. Accuracy target is **correct order of magnitude**, not precision — precision is not achievable under ADR-0001 and pretending otherwise would be dishonest.

**Provenance, and its limits.** There is no free, openly-licensed dataset of typical per-country travel costs; Numbeo and Budget Your Trip have the data but restrict redistribution, and no open source of historical airfares exists at all. The first version therefore ships **unverified estimates written from the author's general knowledge**, not looked-up figures. The dataset file must state this in a header comment along with the date it was generated, and the UI disclaimer must not imply the numbers were sourced.

This is acceptable only because the dataset is an isolated static file that no test depends on — a wrong number is a data fix, not a code change. It is **not** acceptable if this product is ever published for real users, at which point the figures must be replaced with manually verified ones.

### Currency

TWD throughout. No conversion, no currency selection.

## Testing Decisions

### What makes a good test here

A good test states a fact about **what a Traveler sees**, expressed only through `planTrips`'s inputs and return value. It never reaches into how the cost was computed, in what order the filters ran, or which helper did the sorting. If the internals are rewritten and the tests still pass, the tests were good.

### The seam

`planTrips` is the **only** behavioural test seam. Everything the product does is observable in its return value, so everything is tested through it. Cost calculation, Minimum Stay filtering, Affordable/Shortfall classification and ordering do **not** get their own tests — they are implementation details of this function.

### Test data

Tests construct their own small `Destination` fixtures inline. They must **not** import the real dataset — a test that breaks because someone corrected the price of a hotel in Osaka is a bad test.

### Behaviour to cover

- A Destination under Budget comes back `affordable` with `shortfall: 0`.
- A Destination over Budget comes back `shortfall` with the exact difference.
- A Destination exactly equal to Budget is `affordable` (the boundary is inclusive — see Further Notes).
- Trip Cost scales with Vacation Days on both the accommodation and daily-spend terms, and not on the flight term.
- A Destination whose Minimum Stay exceeds Vacation Days is absent from the result entirely.
- Each Minimum Stay band boundary (4 h and 10 h flight time) behaves as specified.
- Affordable plans precede all shortfall plans.
- Affordable plans are ordered most-expensive-first.
- Shortfall plans are ordered smallest-shortfall-first.
- Equal-cost Destinations come back in a stable, deterministic order.
- An empty `destinations` array returns an empty array, not an error.
- No Destination affordable → returns only shortfall plans.
- No Destination passes the Minimum Stay filter → returns an empty array.

### Data integrity

Separately from the behaviour tests, one cheap check over the **real** dataset: ids are unique, and every numeric field is positive. This is a data assertion, not a behaviour test, and it is the only place the real dataset is imported by a test.

### Prior art

None — this is the first feature in an empty repo. These tests set the pattern.

## Out of Scope

- **Visas and entry requirements, entirely.** No visa rules, no entry fees (ETIAS / UK ETA / e-visa), no processing lead times, no visa-free day caps. This is a deliberate exclusion, decided explicitly during design. A future reader will be tempted to "fix" this; it is not a bug. The UI carries a disclaimer instead.
- **Departure dates and seasonality.** No date input, no peak/off-season pricing. See ADR-0001.
- **Live prices.** No flight or hotel APIs, no booking, no deep links to booking sites. See ADR-0001.
- **Group travel.** Single Traveler only. Accommodation is not shared across people.
- **Cities.** Destinations are countries.
- **Origins other than Taiwan.** Flight costs and times are from Taiwan only.
- **Accounts, persistence, saved searches, sharing.**
- **Currency conversion.**
- **"How long until I can afford it"** — no savings-rate input, no time-to-afford projection. Shortfall is expressed in money only.

## Further Notes

- **The boundary is inclusive.** `tripCost === budget` counts as Affordable. Given the numbers are estimates, an exclusive boundary would be false precision, and telling someone they can't go because they're NT$0 short would be absurd.
- **Over-estimation is deliberate.** Both the nights-equal-days simplification and the "correct order of magnitude" data target lean toward over-estimating Trip Cost. For a product that exists to remove anxiety, the failure mode of "cost slightly less than expected" is much kinder than "cost more than the app said".
- **The disclaimer is load-bearing, not legal boilerplate.** The product's entire value is being trusted. Presenting estimates as if they were quotes would destroy that on the user's first real price check. It must be visible, not buried.
- **The empty state matters more than usual.** A Traveler who gets zero results is exactly the person the product was built for, at their most discouraged moment. "Nothing found" is the wrong answer; distinguishing "your Budget is the constraint" from "your Vacation Days are the constraint" is the right one.
