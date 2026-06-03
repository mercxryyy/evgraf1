import { Shape } from './shape';
import { Bounds, boundsFromPoints } from './bounds';
import type { RasterRenderer } from '../raster/RasterRenderer';

export class CubicBezier extends Shape {
    private _points: { x: number; y: number }[] = []; // [p0, p1, p2, p3]

    constructor(p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }, id?: string) {
        super(id);
        this._points = [p0, p1, p2, p3];
        this.recenter();
    }

    private recenter() {
        const xs = this._points.map(p => p.x);
        const ys = this._points.map(p => p.y);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        this._points = this._points.map(p => ({ x: p.x - cx, y: p.y - cy }));
        this.transform.x = cx;
        this.transform.y = cy;
    }

    getControlPoints(): { x: number; y: number }[] {
        return this._points;
    }

    setControlPoint(idx: number, pt: { x: number; y: number }): void {
        if (idx >= 0 && idx < 4) {
            this._points[idx] = pt;
            this.recenter();
        }
    }

    evalLocal(t: number): { x: number; y: number } {
        const [p0, p1, p2, p3] = this._points;
        const mt = 1 - t;
        const x = mt*mt*mt * p0.x + 3*mt*mt*t * p1.x + 3*mt*t*t * p2.x + t*t*t * p3.x;
        const y = mt*mt*mt * p0.y + 3*mt*mt*t * p1.y + 3*mt*t*t * p2.y + t*t*t * p3.y;
        return { x, y };
    }

    flattenDevicePoints(step = 0.05): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = [];
        for (let t = 0; t <= 1; t += step) {
            const local = this.evalLocal(t);
            points.push(this.transformPointToDevice(local.x, local.y));
        }
        const lastLocal = this.evalLocal(1);
        const lastWorld = this.transformPointToDevice(lastLocal.x, lastLocal.y);
        points[points.length-1] = lastWorld;
        return points;
    }

    drawRaster(r: RasterRenderer): void {
        const points = this.flattenDevicePoints(0.05);
        if (points.length < 2) return;
        if (this.strokeWidth > 0 && this.strokeOpacity > 0) {
            const strokeColor = this.hexToRGBA(this.strokeStyle, 255 * this.strokeOpacity);
            for (let i = 0; i < points.length - 1; i++) {
                r.strokeLine(points[i].x, points[i].y, points[i+1].x, points[i+1].y, strokeColor, this.strokeWidth);
            }
        }
    }

    private pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
        const abx = bx - ax;
        const aby = by - ay;
        const t = ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby);
        if (t < 0) return Math.hypot(px - ax, py - ay);
        if (t > 1) return Math.hypot(px - bx, py - by);
        const projx = ax + t * abx;
        const projy = ay + t * aby;
        return Math.hypot(px - projx, py - projy);
    }

    hitTest(px: number, py: number): boolean {
        const points = this.flattenDevicePoints(0.05);
        let minDist = Infinity;
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i], b = points[i+1];
            const dist = this.pointToSegmentDistance(px, py, a.x, a.y, b.x, b.y);
            if (dist < minDist) minDist = dist;
        }
        const threshold = this.strokeWidth / 2 + 5;
        return minDist <= threshold;
    }

    getBounds(): Bounds {
        const points = this.flattenDevicePoints(0.05);
        return boundsFromPoints(points);
    }

    getLocalBounds(): Bounds {
        return boundsFromPoints(this._points);
    }

    toJSON() {
        return {
            type: 'cubicBezier',
            id: this.id,
            points: this._points,
            transform: {
                x: this.transform.x,
                y: this.transform.y,
                rotation: this.transform.rotation,
                scaleX: this.transform.scaleX,
                scaleY: this.transform.scaleY,
            },
            strokeStyle: this.strokeStyle,
            strokeWidth: this.strokeWidth,
            strokeOpacity: this.strokeOpacity,
        };
    }

    clone(): CubicBezier {
        const cb = new CubicBezier({x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, this.id);
        cb._points = this._points.map(p => ({ ...p }));
        cb.transform.copyFrom(this.transform);
        cb.strokeStyle = this.strokeStyle;
        cb.strokeWidth = this.strokeWidth;
        cb.strokeOpacity = this.strokeOpacity;
        return cb;
    }
}