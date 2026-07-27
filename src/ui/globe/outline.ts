/** 一個國家的輪廓，來自 Natural Earth（見 `src/data/countryOutlines.ts`）。 */
export type CountryOutline = {
  type: 'Feature';
  properties: {
    /** ISO 3166-1 alpha-2，對應 Destination 的 id；少數地方沒有代碼，為 null。 */
    iso: string | null;
    name: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
};

/**
 * 輪廓的粗略中心點（外接矩形的中心），用來把地球轉到某個國家。
 * 不是面積重心——對「把鏡頭轉過去」這個用途來說不需要那麼準。
 */
export function centreOf(outline: CountryOutline): { lat: number; lng: number } {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  const visit = (node: unknown): void => {
    if (!Array.isArray(node)) return;
    const [first, second] = node;
    if (typeof first === 'number' && typeof second === 'number') {
      minLng = Math.min(minLng, first);
      maxLng = Math.max(maxLng, first);
      minLat = Math.min(minLat, second);
      maxLat = Math.max(maxLat, second);
      return;
    }
    for (const child of node) visit(child);
  };
  visit(outline.geometry.coordinates);

  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
}
