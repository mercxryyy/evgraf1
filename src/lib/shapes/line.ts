import { Shape } from './shape';
import { type Bounds, boundsFromPoints } from './bounds';
import type { RasterRenderer, RGBA } from '../raster/RasterRenderer';

export class Line extends Shape {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number, id?: string) {
        super(id);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    private getLocalPoints(): { x: number; y: number }[] {
        return [
            { x: this.x1, y: this.y1 },
            { x: this.x2, y: this.y2 },
        ];
    }

    drawRaster(r: RasterRenderer): void {
        const p1 = this.transformPointToDevice(this.x1, this.y1);
        const p2 = this.transformPointToDevice(this.x2, this.y2);
        if (this.strokeWidth > 0 && this.strokeOpacity > 0) {
            const strokeColor = this.hexToRGBA(this.strokeStyle, 255 * this.strokeOpacity);
            r.strokeLine(p1.x, p1.y, p2.x, p2.y, strokeColor, this.strokeWidth);
        }
    }

    private pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
        const abx = bx - ax;
        const aby = by - ay;
        const t = ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby);
        if (t < 0) return Math.hypot(px - ax, py - ay);
        if (t > 1) return Math.hypot(px - bx, py - by);
        const projX = ax + t * abx;
        const projY = ay + t * aby;
        return Math.hypot(px - projX, py - projY);
    }

    hitTest(px: number, py: number): boolean {
        const local = this.transformPointToLocal(px, py);
        const dist = this.pointToSegmentDistance(local.x, local.y, this.x1, this.y1, this.x2, this.y2);
        const threshold = this.strokeWidth / 2 + 5; // +5 для удобства клика
        return dist <= threshold;
    }

    getBounds(): Bounds {
        const pts = this.getLocalPoints().map(p => this.transformPointToDevice(p.x, p.y));
        return boundsFromPoints(pts);
    }

    getLocalBounds(): Bounds {
        return boundsFromPoints(this.getLocalPoints());
    }

    toJSON() {
        return {
            type: 'line',
            id: this.id,
            x1: this.x1, y1: this.y1,
            x2: this.x2, y2: this.y2,
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

    clone(): Line {
        const line = new Line(this.x1, this.y1, this.x2, this.y2, this.id);
        line.transform.copyFrom(this.transform);
        line.strokeStyle = this.strokeStyle;
        line.strokeWidth = this.strokeWidth;
        line.strokeOpacity = this.strokeOpacity;
        return line;
    }
}