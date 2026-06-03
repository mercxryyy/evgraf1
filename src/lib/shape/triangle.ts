import { Shape } from './shape';
import { Bounds, boundsFromPoints } from './bounds';
import type { RasterRenderer } from '../raster/RasterRenderer';

export class Triangle extends Shape {
    private _localPoints: { x: number; y: number }[] = [];

    constructor(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }, id?: string) {
        super(id);
        this.setLocalPoints([p1, p2, p3]);
    }

    // Приведение вершин к локальной системе (центр = среднее арифметическое)
    private setLocalPoints(points: { x: number; y: number }[]) {
        const cx = (points[0].x + points[1].x + points[2].x) / 3;
        const cy = (points[0].y + points[1].y + points[2].y) / 3;
        this._localPoints = points.map(p => ({ x: p.x - cx, y: p.y - cy }));
        this.transform.x = cx;
        this.transform.y = cy;
    }

    getLocalPoints(): { x: number; y: number }[] {
        return this._localPoints;
    }

    resizeFromDeviceAABB(minX: number, minY: number, maxX: number, maxY: number): void {
        const localBounds = this.getLocalBounds();
        const localWidth = localBounds.maxX - localBounds.minX;
        const localHeight = localBounds.maxY - localBounds.minY;
        if (localWidth === 0 || localHeight === 0) return;
        const newWidth = maxX - minX;
        const newHeight = maxY - minY;
        this.transform.scaleX = newWidth / localWidth;
        this.transform.scaleY = newHeight / localHeight;
        this.transform.x = (minX + maxX) / 2;
        this.transform.y = (minY + maxY) / 2;
    }

    drawRaster(r: RasterRenderer): void {
        const worldPoints = this._localPoints.map(p => this.transformPointToDevice(p.x, p.y));
        if (this.fillOpacity > 0) {
            const fillColor = this.hexToRGBA(this.fillStyle, 255 * this.fillOpacity);
            r.fillPolygon(worldPoints, fillColor);
        }
        if (this.strokeWidth > 0 && this.strokeOpacity > 0) {
            const strokeColor = this.hexToRGBA(this.strokeStyle, 255 * this.strokeOpacity);
            r.strokePolygon(worldPoints, strokeColor, this.strokeWidth);
        }
    }

    hitTest(px: number, py: number): boolean {
        const local = this.transformPointToLocal(px, py);
        const sign = (p1: {x:number,y:number}, p2: {x:number,y:number}, p3: {x:number,y:number}) => {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        };
        const [a,b,c] = this._localPoints;
        const d1 = sign(local, a, b);
        const d2 = sign(local, b, c);
        const d3 = sign(local, c, a);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(hasNeg && hasPos);
    }

    getBounds(): Bounds {
        const worldPoints = this._localPoints.map(p => this.transformPointToDevice(p.x, p.y));
        return boundsFromPoints(worldPoints);
    }

    getLocalBounds(): Bounds {
        return boundsFromPoints(this._localPoints);
    }

    toJSON() {
        return {
            type: 'triangle',
            id: this.id,
            points: this._localPoints.map(p => ({ x: p.x, y: p.y })),
            transform: {
                x: this.transform.x,
                y: this.transform.y,
                rotation: this.transform.rotation,
                scaleX: this.transform.scaleX,
                scaleY: this.transform.scaleY,
            },
            fillStyle: this.fillStyle,
            fillOpacity: this.fillOpacity,
            strokeStyle: this.strokeStyle,
            strokeWidth: this.strokeWidth,
            strokeOpacity: this.strokeOpacity,
        };
    }

    clone(): Triangle {
        const tri = new Triangle({x:0,y:0}, {x:0,y:0}, {x:0,y:0}, this.id);
        tri._localPoints = this._localPoints.map(p => ({ ...p }));
        tri.transform.copyFrom(this.transform);
        tri.fillStyle = this.fillStyle;
        tri.fillOpacity = this.fillOpacity;
        tri.strokeStyle = this.strokeStyle;
        tri.strokeWidth = this.strokeWidth;
        tri.strokeOpacity = this.strokeOpacity;
        return tri;
    }
}