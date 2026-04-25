export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export function boundsFromPoints(points: { x: number; y: number }[]): Bounds {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}