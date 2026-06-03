// src/lib/shapes/pathBezier.ts
import { Shape } from './shape';
import { Bounds } from './bounds';
import type { Point } from './types';      // если у тебя Point определён в types.ts
// Если нет Point – раскомментируй следующую строку и закомментируй импорт выше:
// type Point = { x: number; y: number };
import type { RasterRenderer, RGBA } from '../raster/RasterRenderer';

export type PathBezierMode = 'polyline' | 'bezier' | 'catmull';

export class PathBezier extends Shape {
    private _points: Point[];
    private _mode: PathBezierMode;
    private _closed: boolean;

    // КОНСТРУКТОР – как у тебя: принимает точки, режим, замкнутость, id
    constructor(points: Point[] = [], mode: PathBezierMode = 'polyline', closed: boolean = false, id?: string) {
        super(id);
        this._points = points.map(p => ({ ...p }));
        this._mode = mode;
        this._closed = closed;
        this.recenter();              // центрируем (как у других фигур)
    }

    // центрирование точек относительно их центра (чтобы трансформация работала от центра)
    private recenter() {
        if (this._points.length === 0) return;
        const xs = this._points.map(p => p.x);
        const ys = this._points.map(p => p.y);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        this._points = this._points.map(p => ({ x: p.x - cx, y: p.y - cy }));
        this.transform.x = cx;
        this.transform.y = cy;
    }

    // ------------------- геттеры / сеттеры -------------------
    get points(): Point[] { return this._points.map(p => ({ ...p })); }
    get mode(): PathBezierMode { return this._mode; }
    get closed(): boolean { return this._closed; }

    set mode(value: PathBezierMode) { this._mode = value; }
    set closed(value: boolean) { this._closed = value; }

    // ------------------- вычисление точки на пути по параметру t -------------------
    evalLocal(t: number): Point {
        if (this._points.length === 0) return { x: 0, y: 0 };
        if (this._points.length === 1) return { ...this._points[0] };

        const clampedT = Math.max(0, Math.min(1, t));
        const segmentCount = this._closed ? this._points.length : this._points.length - 1;
        if (segmentCount === 0) return { ...this._points[0] };

        const segmentT = clampedT * segmentCount;
        const segmentIndex = Math.floor(segmentT);
        const localT = segmentT - segmentIndex;

        const p1Index = segmentIndex % this._points.length;
        const p2Index = (segmentIndex + 1) % this._points.length;

        const p1 = this._points[p1Index];
        const p2 = this._points[p2Index];

        return {
            x: p1.x + (p2.x - p1.x) * localT,
            y: p1.y + (p2.y - p1.y) * localT
        };
    }

    // ------------------- аппроксимация пути ломаной (для отрисовки и hit-теста) -------------------
    flattenDevicePoints(flatness: number): Point[] {
        if (this._points.length === 0) return [];

        switch (this._mode) {
            case 'polyline': return this.flattenPolyline(flatness);
            case 'bezier':   return this.flattenBeziers(flatness);
            case 'catmull':  return this.flattenCatmull(flatness);
            default:         return this.flattenPolyline(flatness);
        }
    }

    private flattenPolyline(_flatness: number): Point[] {
        const result: Point[] = [];
        const endIndex = this._closed ? this._points.length : this._points.length - 1;
        for (let i = 0; i < endIndex; i++) {
            result.push(this.transformPointToDevice(this._points[i].x, this._points[i].y));
        }
        if (this._closed && this._points.length > 0) {
            result.push(this.transformPointToDevice(this._points[0].x, this._points[0].y));
        }
        return result;
    }

    private flattenBeziers(flatness: number): Point[] {
        const result: Point[] = [];
        const bezierCount = Math.floor(this._points.length / 4);
        for (let i = 0; i < bezierCount; i++) {
            const base = i * 4;
            const p0 = this._points[base];
            const p1 = this._points[base + 1];
            const p2 = this._points[base + 2];
            const p3 = this._points[base + 3];
            const segPoints = this.flattenCubicBezier(p0, p1, p2, p3, flatness);
            if (result.length && segPoints.length) result.pop(); // убираем дубликат на стыке
            result.push(...segPoints);
        }
        return result;
    }

    private flattenCubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, flatness: number): Point[] {
        const points: Point[] = [];
        const len0 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const len1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const len2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        const maxLen = Math.max(len0, len1, len2);
        const steps = Math.max(20, Math.ceil(maxLen / flatness));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const invT = 1 - t;
            const x = invT ** 3 * p0.x + 3 * invT ** 2 * t * p1.x + 3 * invT * t ** 2 * p2.x + t ** 3 * p3.x;
            const y = invT ** 3 * p0.y + 3 * invT ** 2 * t * p1.y + 3 * invT * t ** 2 * p2.y + t ** 3 * p3.y;
            points.push(this.transformPointToDevice(x, y));
        }
        return points;
    }

    // ---------- Catmull-Rom → кубические Безье (ключевой метод для гладкого catmull) ----------
    catmullToBeziers(): Point[] {
        const bez: Point[] = [];
        const n = this._points.length;
        if (n < 2) return this._points.map(p => ({ ...p }));
        if (n === 2) {
            return [this._points[0], this._points[1], this._points[1], this._points[1]];
        }
        const segments = this._closed ? n : n - 1;
        for (let i = 0; i < segments; i++) {
            let p0Idx, p1Idx, p2Idx, p3Idx;
            if (this._closed) {
                p0Idx = (i - 1 + n) % n;
                p1Idx = i;
                p2Idx = (i + 1) % n;
                p3Idx = (i + 2) % n;
            } else {
                p0Idx = i === 0 ? 0 : i - 1;
                p1Idx = i;
                p2Idx = (i + 1) % n;
                p3Idx = i === n - 2 ? n - 1 : i + 2;
            }
            const p0 = this._points[p0Idx];
            const p1 = this._points[p1Idx];
            const p2 = this._points[p2Idx];
            const p3 = this._points[p3Idx];
            const tension = 0.5;
            const cp1x = p1.x + (p2.x - p0.x) * tension / 2;
            const cp1y = p1.y + (p2.y - p0.y) * tension / 2;
            const cp2x = p2.x - (p3.x - p1.x) * tension / 2;
            const cp2y = p2.y - (p3.y - p1.y) * tension / 2;
            bez.push({ ...p1 }, { x: cp1x, y: cp1y }, { x: cp2x, y: cp2y }, { ...p2 });
        }
        return bez;
    }

    private flattenCatmull(flatness: number): Point[] {
        const bezierPoints = this.catmullToBeziers();
        if (bezierPoints.length < 4) return this.flattenPolyline(flatness);
        const result: Point[] = [];
        const cnt = bezierPoints.length / 4;
        for (let i = 0; i < cnt; i++) {
            const base = i * 4;
            const p0 = bezierPoints[base];
            const p1 = bezierPoints[base + 1];
            const p2 = bezierPoints[base + 2];
            const p3 = bezierPoints[base + 3];
            const segPoints = this.flattenCubicBezier(p0, p1, p2, p3, flatness);
            if (result.length && segPoints.length) result.pop();
            result.push(...segPoints);
        }
        return result;
    }

    // ------------------- управление точками -------------------
    addPointLocal(x: number, y: number): void {
        this._points.push({ x, y });
        this.recenter();
    }
    addPoint(point: Point): void {
        this._points.push({ ...point });
        this.recenter();
    }
    removePoint(index: number): void {
        if (index >= 0 && index < this._points.length) {
            this._points.splice(index, 1);
            this.recenter();
        }
    }
    setPoint(index: number, point: Point): void {
        if (index >= 0 && index < this._points.length) {
            this._points[index] = { ...point };
            this.recenter();
        }
    }
    getPoint(index: number): Point | null {
        if (index >= 0 && index < this._points.length) {
            return { ...this._points[index] };
        }
        return null;
    }
    getControlPoints(): Point[] {
        return this._points.map(p => ({ ...p }));
    }
    setControlPoint(idx: number, pt: Point): void {
        if (idx >= 0 && idx < this._points.length) {
            this._points[idx] = { ...pt };
            this.recenter();
        } else {
            throw new Error(`Invalid control point index: ${idx}`);
        }
    }

    // ------------------- границы -------------------
    getLocalBounds(): Bounds {
    if (this._points.length === 0) {
        return new Bounds(0, 0, 0, 0);
    }
    const b = Bounds.fromPoints(this._points);
    return b ?? new Bounds(0, 0, 0, 0);
}

getBounds(): Bounds {
    const flatness = 5;
    const pts = this.flattenDevicePoints(flatness);
    if (pts.length === 0) {
        return new Bounds(0, 0, 0, 0);
    }
    const b = Bounds.fromPoints(pts);
    return b ?? new Bounds(0, 0, 0, 0);
}

    // ------------------- отрисовка (через растеризатор) -------------------
    drawRaster(r: RasterRenderer): void {
        const flatness = 1;
        let points = this.flattenDevicePoints(flatness);
        if (points.length < 2) return;
        if (this._closed && points.length > 2) {
            points = [...points, points[0]];
        }
        if (this.fillOpacity > 0 && this._closed) {
            const fillColor = this.hexToRGBA(this.fillStyle, 255 * this.fillOpacity);
            r.fillPolygon(points, fillColor);
        }
        if (this.strokeOpacity > 0 && this.strokeWidth > 0) {
            const strokeColor = this.hexToRGBA(this.strokeStyle, 255 * this.strokeOpacity);
            r.strokePolygon(points, strokeColor, this.strokeWidth);
        }
    }

    // ------------------- hit test (проверка попадания) -------------------
    hitTest(px: number, py: number): boolean {
        const localP = this.transformPointToLocal(px, py);
        if (!localP) return false;
        const threshold = this.strokeWidth / 2 + 2;
        switch (this._mode) {
            case 'polyline': return this.hitTestPolyline(localP, threshold);
            case 'bezier':   return this.hitTestBeziers(localP, threshold);
            case 'catmull':  return this.hitTestCatmull(localP, threshold);
            default:         return this.hitTestPolyline(localP, threshold);
        }
    }

    private hitTestPolyline(localP: Point, threshold: number): boolean {
        const pts = this._points;
        for (let i = 0; i < pts.length - 1; i++) {
            if (this.pointToSegmentDistance(localP.x, localP.y, pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y) <= threshold)
                return true;
        }
        if (this._closed && pts.length > 1) {
            if (this.pointToSegmentDistance(localP.x, localP.y, pts[pts.length-1].x, pts[pts.length-1].y, pts[0].x, pts[0].y) <= threshold)
                return true;
        }
        return false;
    }

    private hitTestBeziers(localP: Point, threshold: number): boolean {
        const cnt = Math.floor(this._points.length / 4);
        for (let i = 0; i < cnt; i++) {
            const base = i * 4;
            if (this.hitTestCubicBezier(localP,
                this._points[base], this._points[base+1], this._points[base+2], this._points[base+3],
                threshold)) return true;
        }
        return false;
    }

    private hitTestCubicBezier(localP: Point, p0: Point, p1: Point, p2: Point, p3: Point, threshold: number): boolean {
        const steps = 50;
        for (let i = 0; i < steps; i++) {
            const t1 = i / steps;
            const t2 = (i + 1) / steps;
            const bp1 = this.evalCubicPoint(t1, p0, p1, p2, p3);
            const bp2 = this.evalCubicPoint(t2, p0, p1, p2, p3);
            if (this.pointToSegmentDistance(localP.x, localP.y, bp1.x, bp1.y, bp2.x, bp2.y) <= threshold)
                return true;
        }
        return false;
    }

    private evalCubicPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
        const inv = 1 - t;
        return {
            x: inv ** 3 * p0.x + 3 * inv ** 2 * t * p1.x + 3 * inv * t ** 2 * p2.x + t ** 3 * p3.x,
            y: inv ** 3 * p0.y + 3 * inv ** 2 * t * p1.y + 3 * inv * t ** 2 * p2.y + t ** 3 * p3.y
        };
    }

    private hitTestCatmull(localP: Point, threshold: number): boolean {
        const bezierPoints = this.catmullToBeziers();
        const cnt = Math.floor(bezierPoints.length / 4);
        for (let i = 0; i < cnt; i++) {
            const base = i * 4;
            if (this.hitTestCubicBezier(localP,
                bezierPoints[base], bezierPoints[base+1], bezierPoints[base+2], bezierPoints[base+3],
                threshold)) return true;
        }
        return false;
    }

    private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len2 = dx * dx + dy * dy;
        if (len2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.hypot(px - projX, py - projY);
    }

    // ------------------- сериализация и клонирование -------------------
    toJSON(): any {
        return {
            type: 'PathBezier',
            points: this._points,
            mode: this._mode,
            closed: this._closed,
            transform: this.transform,
            fillStyle: this.fillStyle,
            fillOpacity: this.fillOpacity,
            strokeStyle: this.strokeStyle,
            strokeWidth: this.strokeWidth,
            strokeOpacity: this.strokeOpacity,
            version: 1,
        };
    }

    clone(): PathBezier {
        const cloned = new PathBezier([], this._mode, this._closed, this.id);
        cloned._points = this._points.map(p => ({ ...p }));
        cloned.transform = this.transform.clone();
        cloned.fillStyle = this.fillStyle;
        cloned.fillOpacity = this.fillOpacity;
        cloned.strokeStyle = this.strokeStyle;
        cloned.strokeWidth = this.strokeWidth;
        cloned.strokeOpacity = this.strokeOpacity;
        return cloned;
    }
}