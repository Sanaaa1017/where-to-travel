import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial } from 'three';
import { countryOutlines } from '../../data/countryOutlines';
import { regionName } from '../regionName';
import type { Tone } from '../TripList';
import { centreOf, type CountryOutline } from './outline';

// 夜航時從窗外看到的地球：深藍的海和陸地，去得起的國家像城市燈火一樣亮起來，
// 差一點的國家是遠方較冷、較淡的光。
const OCEAN = '#0a0f28';
const LAND = '#1f2754';
const LAND_SIDE = 'rgba(31, 39, 84, 0.6)';
const LAND_STROKE = '#2e3970';
const ATMOSPHERE = '#7c89d9';

const TONE_CAP: Record<Tone, string> = {
  affordable: '#ffb547',
  shortfall: 'rgba(154, 166, 234, 0.72)',
  estimate: 'rgba(236, 238, 248, 0.55)',
  // 有資料、但目前不在清單上的地方：比一般陸地亮一點，讓人知道點得下去。
  idle: '#2c3770',
};

const TONE_SIDE: Record<Tone, string> = {
  affordable: 'rgba(255, 181, 71, 0.35)',
  shortfall: 'rgba(154, 166, 234, 0.22)',
  estimate: 'rgba(236, 238, 248, 0.2)',
  idle: LAND_SIDE,
};

const TONE_LIFT: Record<Tone, number> = {
  affordable: 0.02,
  shortfall: 0.014,
  estimate: 0.014,
  idle: 0.008,
};

/** 每條航線都從台北出發。 */
const TAIPEI = { lat: 25.04, lng: 121.56 };
const ORIGIN = [TAIPEI];

/** 110m 輪廓裡沒有的小地方，在地球上改用一個點標示。 */
const POINT_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  HK: { lat: 22.32, lng: 114.17 },
  SG: { lat: 1.35, lng: 103.82 },
};

const centreByIso = new Map<string, { lat: number; lng: number }>([
  ...countryOutlines.flatMap((outline) =>
    outline.properties.iso ? [[outline.properties.iso, centreOf(outline)] as const] : [],
  ),
  ...Object.entries(POINT_LOCATIONS),
]);

/** 回到台灣附近；窄螢幕上地球拉近一點，才不會縮在一大片夜空中間。 */
function homeView(width: number) {
  return { lat: 20, lng: 118, altitude: width < 600 ? 1.75 : 2.2 };
}

/** 地球上一個有資料的地方現在該怎麼標示。 */
export type GlobeMark = {
  id: string;
  name: string;
  tone: Tone;
  /** 滑過時顯示的第二行 */
  note: string;
};

type Arc = {
  id: string;
  tone: Tone;
  endLat: number;
  endLng: number;
};

type Props = {
  marks: GlobeMark[];
  /** 目前被選起來的地方，地球會轉過去。 */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function GlobeView({ marks, selectedId, onSelect }: Props) {
  const globe = useRef<GlobeMethods | undefined>(undefined);
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [reduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const markById = useMemo(() => new Map(marks.map((mark) => [mark.id, mark])), [marks]);
  const pointMarks = useMemo(() => marks.filter((mark) => mark.id in POINT_LOCATIONS), [marks]);

  // 航線：去得起與差一點的地方各一條，加上目前選起來的那一個。
  // 航線物件盡量沿用上一次的：地球用物件本身辨認航線，
  // 沿用的不會重畫，只有新出現的地方會從台北升起一條新航線。
  const arcCache = useRef(new Map<string, Arc>());
  const arcs = useMemo(() => {
    const next = new Map<string, Arc>();
    for (const mark of marks) {
      const routed = mark.tone === 'affordable' || mark.tone === 'shortfall';
      if (!routed && mark.id !== selectedId) continue;
      const end = centreByIso.get(mark.id);
      if (!end) continue;
      const cached = arcCache.current.get(mark.id);
      next.set(
        mark.id,
        cached?.tone === mark.tone
          ? cached
          : { id: mark.id, tone: mark.tone, endLat: end.lat, endLng: end.lng },
      );
    }
    arcCache.current = next;
    return [...next.values()];
  }, [marks, selectedId]);

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
    controls.minDistance = 160;
    controls.maxDistance = 600;
    const stopSpinning = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopSpinning);
    instance.pointOfView(homeView(size.width));
    return () => controls.removeEventListener('start', stopSpinning);
  }, [size.width > 0]);

  // 第一次有結果時，地球轉回台灣，讓 Traveler 看著航線一條條升起來。
  const hasResults = marks.some((mark) => mark.tone !== 'idle');
  useEffect(() => {
    const instance = globe.current;
    if (!instance || !hasResults || selectedId) return;
    instance.controls().autoRotate = false;
    instance.pointOfView(homeView(size.width), reduceMotion ? 0 : 1000);
  }, [hasResults]);

  // 選了一個有資料的地方，地球轉過去。沒資料的國家不轉，免得 Traveler 要追著地球點下一個。
  useEffect(() => {
    const instance = globe.current;
    if (!instance || !selectedId || !markById.has(selectedId)) return;
    const centre = centreByIso.get(selectedId);
    if (!centre) return;
    instance.controls().autoRotate = false;
    instance.pointOfView({ ...centre, altitude: 1.8 }, reduceMotion ? 0 : 900);
  }, [selectedId]);

  const isoOf = (polygon: object) => (polygon as CountryOutline).properties.iso ?? '';
  const toneOf = (id: string) => markById.get(id)?.tone;

  const altitude = (polygon: object) => {
    const iso = isoOf(polygon);
    const tone = toneOf(iso);
    const lift = tone ? TONE_LIFT[tone] : 0.006;
    return iso === selectedId ? lift + 0.015 : lift;
  };

  const tooltip = (id: string, fallbackName: string) => {
    const mark = markById.get(id);
    if (!mark) return `<div class="globe-tip quiet">${regionName(id, fallbackName)}</div>`;
    return `<div class="globe-tip ${mark.tone}"><strong>${mark.name}</strong><span>${mark.note}</span></div>`;
  };

  const arcOf = (arc: object) => arc as Arc;
  const pointOf = (point: object) => point as GlobeMark;

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
          polygonCapColor={(polygon: object) => {
            const iso = isoOf(polygon);
            const tone = toneOf(iso);
            // 選起來的地方如果本來沒有亮燈，就讓它亮成白色，看得出點到的是哪一國。
            if (iso === selectedId && (tone === 'idle' || tone === 'estimate')) {
              return 'rgba(236, 238, 248, 0.8)';
            }
            return tone ? TONE_CAP[tone] : LAND;
          }}
          polygonSideColor={(polygon: object) => {
            const tone = toneOf(isoOf(polygon));
            return tone ? TONE_SIDE[tone] : LAND_SIDE;
          }}
          polygonStrokeColor={() => LAND_STROKE}
          polygonAltitude={altitude}
          polygonsTransitionDuration={reduceMotion ? 0 : 300}
          polygonLabel={(polygon: object) =>
            tooltip(isoOf(polygon), (polygon as CountryOutline).properties.name)
          }
          onPolygonClick={(polygon: object) => onSelect(isoOf(polygon) || null)}
          pointsData={pointMarks}
          pointLat={(point: object) => POINT_LOCATIONS[pointOf(point).id]?.lat ?? 0}
          pointLng={(point: object) => POINT_LOCATIONS[pointOf(point).id]?.lng ?? 0}
          pointColor={(point: object) => {
            const { tone } = pointOf(point);
            return tone === 'idle' ? '#5a65a3' : TONE_CAP[tone];
          }}
          pointAltitude={(point: object) => (pointOf(point).id === selectedId ? 0.06 : 0.03)}
          pointRadius={1.1}
          pointsTransitionDuration={reduceMotion ? 0 : 300}
          pointLabel={(point: object) => tooltip(pointOf(point).id, pointOf(point).name)}
          onPointClick={(point: object) => onSelect(pointOf(point).id)}
          arcsData={arcs}
          arcStartLat={() => TAIPEI.lat}
          arcStartLng={() => TAIPEI.lng}
          arcEndLat={(arc: object) => arcOf(arc).endLat}
          arcEndLng={(arc: object) => arcOf(arc).endLng}
          // 選了一個地方時，其他航線退到背景，只有那一條是亮的。
          arcColor={(arc: object) => {
            const { id, tone } = arcOf(arc);
            const dim = selectedId !== null && id !== selectedId;
            if (tone === 'affordable') {
              return dim ? 'rgba(255, 181, 71, 0.18)' : ['rgba(255, 181, 71, 0.55)', '#ffb547'];
            }
            if (tone === 'shortfall') {
              return dim ? 'rgba(154, 166, 234, 0.12)' : 'rgba(154, 166, 234, 0.45)';
            }
            return ['rgba(236, 238, 248, 0.4)', '#eceef8'];
          }}
          arcStroke={(arc: object) => {
            const { id, tone } = arcOf(arc);
            if (id === selectedId) return 0.9;
            return tone === 'shortfall' ? 0.3 : 0.45;
          }}
          // 去得起的是一條實線；差一點的是虛線——那趟還沒成形。
          arcDashLength={(arc: object) => (arcOf(arc).tone === 'shortfall' ? 0.035 : 1)}
          arcDashGap={(arc: object) => (arcOf(arc).tone === 'shortfall' ? 0.025 : 0)}
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
  element.innerHTML = '<span class="origin-dot"></span>Taipei';
  return element;
}
