import { Shape } from './shape';
import { type Bounds, boundsFromPoints } from './bounds';
import type { RasterRenderer, RGBA } from '../raster/RasterRenderer';

export class Oval extends Shape {
    rx: number;
    ry: number;

    constructor(rx: number, ry: number, id?: string) {
        super(id);
        this.rx = rx;
        this.ry = ry;
    }

    private getLocalPoints(segments: number = 48): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const x = this.rx * Math.cos(angle);
            const y = this.ry * Math.sin(angle);
            points.push({ x, y });
        }
        return points;
    }

    drawRaster(r: RasterRenderer): void {
        const localPoints = this.getLocalPoints();
        const worldPoints = localPoints.map(p => this.transformPointToDevice(p.x, p.y));

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
        const nx = local.x / this.rx;
        const ny = local.y / this.ry;
        return nx * nx + ny * ny <= 1;
    }

    getBounds(): Bounds {
        const localPoints = this.getLocalPoints(32);
        const worldPoints = localPoints.map(p => this.transformPointToDevice(p.x, p.y));
        return boundsFromPoints(worldPoints);
    }

    getLocalBounds(): Bounds {
        return { minX: -this.rx, minY: -this.ry, maxX: this.rx, maxY: this.ry };
    }

    toJSON() {
        return {
            type: 'oval',
            id: this.id,
            rx: this.rx,
            ry: this.ry,
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

    clone(): Oval {
        const oval = new Oval(this.rx, this.ry, this.id);
        oval.transform.copyFrom(this.transform);
        oval.fillStyle = this.fillStyle;
        oval.fillOpacity = this.fillOpacity;
        oval.strokeStyle = this.strokeStyle;
        oval.strokeWidth = this.strokeWidth;
        oval.strokeOpacity = this.strokeOpacity;
        return oval;
    }
}