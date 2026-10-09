import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial } from 'three';
import { countryOutlines } from '../../data/countryOutlines';
import type { TripPlan } from '../../domain/types';
import { formatTwd } from '../money';
import { centreOf, type CountryOutline } from './outline';

// 夜航時從窗外看到的地球：深藍的海和陸地，去得起的國家像城市燈火一樣亮起來，
// 差一點的國家是遠方較冷、較淡的光。
const OCEAN = '#0a0f28';
const LAND = '#1f2754';
const LAND_SIDE = 'rgba(31, 39, 84, 0.6)';
const LAND_STROKE = '#2e3970';
const LAMP = '#ffb547';
const LAMP_SIDE = 'rgba(255, 181, 71, 0.35)';
const FAR = 'rgba(154, 166, 234, 0.72)';
const FAR_SIDE = 'rgba(154, 166, 234, 0.22)';
const ATMOSPHERE = '#7c89d9';

/** 每條航線都從台北出發。 */
const TAIPEI = { lat: 25.04, lng: 121.56 };
const ORIGIN = [TAIPEI];

/** 回到台灣附近；窄螢幕上地球拉近一點，才不會縮在一大片夜空中間。 */
function homeView(width: number) {
  return { lat: 20, lng: 118, altitude: width < 600 ? 1.75 : 2.2 };
}

const centreByIso = new Map(
  countryOutlines.flatMap((outline) =>
    outline.properties.iso ? [[outline.properties.iso, centreOf(outline)] as const] : [],
  ),
);

type Arc = {
  id: string;
  status: TripPlan['status'];
  endLat: number;
  endLng: number;
};

type Props = {
  plans: TripPlan[];
  /** 目前被選起來的 Destination id，地球會轉過去。 */
  focusedId: string | null;
  onSelect: (id: string | null) => void;
};

export function GlobeView({ plans, focusedId, onSelect }: Props) {
  const globe = useRef<GlobeMethods | undefined>(undefined);
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [reduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const planByIso = useMemo(() => {
    const map = new Map<string, TripPlan>();
    for (const plan of plans) map.set(plan.destination.id, plan);
    return map;
  }, [plans]);

  // 航線物件盡量沿用上一次的：地球用物件本身辨認航線，
  // 沿用的不會重畫，只有新出現的 Destination 會從台北升起一條新航線。
  const arcCache = useRef(new Map<string, Arc>());
  const arcs = useMemo(() => {
    const next = new Map<string, Arc>();
    for (const plan of plans) {
      const id = plan.destination.id;
      const end = centreByIso.get(id);
      if (!end) continue;
      const cached = arcCache.current.get(id);
      next.set(
        id,
        cached?.status === plan.status
          ? cached
          : { id, status: plan.status, endLat: end.lat, endLng: end.lng },
      );
    }
    arcCache.current = next;
    return [...next.values()];
  }, [plans]);

  const globeMaterial = useMemo(() => new MeshPhongMaterial({ color: OCEAN }), []);

  // 地球隨著容器大小走；react-globe.gl 需要明確的像素尺寸。
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // 一進來就緩緩自轉，使用者一動手就停——之後由使用者主導。
  // 依賴 size：量到容器大小之後 <Globe> 才會掛上，ref 也才有東西。
  useEffect(() => {
    const instance = globe.current;
    if (!instance) return;
    const controls = instance.controls();
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.minDistance = 180;
    controls.maxDistance = 600;
    const stopSpinning = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopSpinning);
    instance.pointOfView(homeView(size.width));
    return () => controls.removeEventListener('start', stopSpinning);
  }, [size.width > 0]);

  // 第一次有結果時，地球轉回台灣，讓 Traveler 看著航線一條條升起來。
  const hasResults = plans.length > 0;
  useEffect(() => {
    const instance = globe.current;
    if (!instance || !hasResults) return;
    instance.controls().autoRotate = false;
    instance.pointOfView(homeView(size.width), reduceMotion ? 0 : 1000);
  }, [hasResults]);

  // 在清單上點一個國家，地球轉過去。
  useEffect(() => {
    const instance = globe.current;
    if (!instance || !focusedId) return;
    const centre = centreByIso.get(focusedId);
    if (!centre) return;
    instance.controls().autoRotate = false;
    instance.pointOfView({ ...centre, altitude: 1.8 }, reduceMotion ? 0 : 900);
  }, [focusedId]);

  const isoOf = (polygon: object) => (polygon as CountryOutline).properties.iso ?? '';

  const capColor = (polygon: object) => {
    const plan = planByIso.get(isoOf(polygon));
    if (!plan) return LAND;
    return plan.status === 'affordable' ? LAMP : FAR;
  };

  const sideColor = (polygon: object) => {
    const plan = planByIso.get(isoOf(polygon));
    if (!plan) return LAND_SIDE;
    return plan.status === 'affordable' ? LAMP_SIDE : FAR_SIDE;
  };

  const altitude = (polygon: object) => {
    const iso = isoOf(polygon);
    const plan = planByIso.get(iso);
    if (!plan) return 0.006;
    const lift = plan.status === 'affordable' ? 0.02 : 0.012;
    return iso === focusedId ? lift + 0.015 : lift;
  };

  const label = (polygon: object) => {
    const outline = polygon as CountryOutline;
    const plan = planByIso.get(isoOf(polygon));
    if (!plan) return `<div class="globe-tip quiet">${outline.properties.name}</div>`;
    const line =
      plan.status === 'affordable'
        ? `${formatTwd(plan.tripCost)}，去得起`
        : `還差 ${formatTwd(plan.shortfall)}`;
    return `<div class="globe-tip ${plan.status}"><strong>${plan.destination.name}</strong><span>${line}</span></div>`;
  };

  // 去得起的是一條實線；差一點的是虛線——那趟還沒成形。
  const arcOf = (arc: object) => arc as Arc;

  return (
    <div className="globe-stage" ref={stage}>
      {size.width > 0 && (
        <Globe
          ref={globe}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          atmosphereColor={ATMOSPHERE}
          atmosphereAltitude={0.16}
          polygonsData={countryOutlines}
          polygonCapColor={capColor}
          polygonSideColor={sideColor}
          polygonStrokeColor={() => LAND_STROKE}
          polygonAltitude={altitude}
          polygonsTransitionDuration={reduceMotion ? 0 : 300}
          polygonLabel={label}
          onPolygonClick={(polygon: object) => onSelect(isoOf(polygon) || null)}
          arcsData={arcs}
          arcStartLat={() => TAIPEI.lat}
          arcStartLng={() => TAIPEI.lng}
          arcEndLat={(arc: object) => arcOf(arc).endLat}
          arcEndLng={(arc: object) => arcOf(arc).endLng}
          arcColor={(arc: object) =>
            arcOf(arc).status === 'affordable'
              ? ['rgba(255, 181, 71, 0.55)', LAMP]
              : 'rgba(154, 166, 234, 0.8)'
          }
          arcStroke={(arc: object) => (arcOf(arc).id === focusedId ? 0.9 : 0.55)}
          arcDashLength={(arc: object) => (arcOf(arc).status === 'affordable' ? 1 : 0.035)}
          arcDashGap={(arc: object) => (arcOf(arc).status === 'affordable' ? 0 : 0.025)}
          arcsTransitionDuration={reduceMotion ? 0 : 1400}
          htmlElementsData={ORIGIN}
          htmlElement={originMarker}
        />
      )}
    </div>
  );
}

function originMarker(): HTMLElement {
  const element = document.createElement('div');
  element.className = 'origin';
  element.innerHTML = '<span class="origin-dot"></span>台北';
  return element;
}
