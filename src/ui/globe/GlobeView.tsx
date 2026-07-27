import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial } from 'three';
import { countryOutlines } from '../../data/countryOutlines';
import type { TripPlan } from '../../domain/types';
import { centreOf, type CountryOutline } from './outline';

const OCEAN = '#080d18';
const LAND = '#1b2434';
const LAND_STROKE = '#2c3648';
const AFFORDABLE = '#3fca7d';
const SHORTFALL = '#c9903a';

const twd = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
});

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

  const planByIso = useMemo(() => {
    const map = new Map<string, TripPlan>();
    for (const plan of plans) map.set(plan.destination.id, plan);
    return map;
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.minDistance = 180;
    controls.maxDistance = 600;
    const stopSpinning = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopSpinning);
    instance.pointOfView({ lat: 12, lng: 115, altitude: 2.4 });
    return () => controls.removeEventListener('start', stopSpinning);
  }, [size.width > 0]);

  // 在清單上點一個國家，地球轉過去。
  useEffect(() => {
    const instance = globe.current;
    if (!instance || !focusedId) return;
    const outline = countryOutlines.find((c) => c.properties.iso === focusedId);
    if (!outline) return;
    instance.controls().autoRotate = false;
    instance.pointOfView({ ...centreOf(outline), altitude: 1.8 }, 900);
  }, [focusedId]);

  const isoOf = (polygon: object) => (polygon as CountryOutline).properties.iso;

  const capColor = (polygon: object) => {
    const plan = planByIso.get(isoOf(polygon) ?? '');
    if (!plan) return LAND;
    return plan.status === 'affordable' ? AFFORDABLE : SHORTFALL;
  };

  const label = (polygon: object) => {
    const outline = polygon as CountryOutline;
    const plan = planByIso.get(outline.properties.iso ?? '');
    if (!plan) return `<div class="globe-tip muted">${outline.properties.name}</div>`;
    const line =
      plan.status === 'affordable'
        ? `去得起 · ${twd.format(plan.tripCost)}`
        : `還差 ${twd.format(plan.shortfall)}`;
    return `<div class="globe-tip"><strong>${plan.destination.name}</strong><span>${line}</span></div>`;
  };

  return (
    <div className="globe-stage" ref={stage}>
      {size.width > 0 && (
        <Globe
          ref={globe}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          atmosphereColor="#5b8cff"
          atmosphereAltitude={0.18}
          polygonsData={countryOutlines}
          polygonCapColor={capColor}
          polygonSideColor={() => 'rgba(63, 202, 125, 0.25)'}
          polygonStrokeColor={() => LAND_STROKE}
          polygonAltitude={(polygon: object) =>
            planByIso.has(isoOf(polygon) ?? '') ? 0.018 : 0.006
          }
          polygonsTransitionDuration={300}
          polygonLabel={label}
          onPolygonClick={(polygon: object) => onSelect(isoOf(polygon))}
        />
      )}
    </div>
  );
}
