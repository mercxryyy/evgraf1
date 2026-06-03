import { Shape } from './shape';
import { type Bounds, boundsFromPoints } from './bounds';
import type { RasterRenderer, RGBA } from '../raster/RasterRenderer';

export class Rect extends Shape {
    w: number;
    h: number;

    constructor(w: number, h: number, id?: string) {
        super(id);
        this.w = w;
        this.h = h;
    }

    private getLocalCorners(): { x: number; y: number }[] {
        const halfW = this.w / 2;
        const halfH = this.h / 2;
        return [
            { x: -halfW, y: -halfH },
            { x:  halfW, y: -halfH },
            { x:  halfW, y:  halfH },
            { x: -halfW, y:  halfH },
        ];
    }

    drawRaster(r: RasterRenderer): void {
        const corners = this.getLocalCorners();
        const worldCorners = corners.map(p => this.transformPointToDevice(p.x, p.y));

        if (this.fillOpacity > 0) {
            const fillColor = this.hexToRGBA(this.fillStyle, 255 * this.fillOpacity);
            r.fillPolygon(worldCorners, fillColor);
        }
        if (this.strokeWidth > 0 && this.strokeOpacity > 0) {
            const strokeColor = this.hexToRGBA(this.strokeStyle, 255 * this.strokeOpacity);
            r.strokePolygon(worldCorners, strokeColor, this.strokeWidth);
        }
    }

    hitTest(px: number, py: number): boolean {
        const local = this.transformPointToLocal(px, py);
        const halfW = this.w / 2;
        const halfH = this.h / 2;
    return local.x >= -halfW && local.x <= halfW && local.y >= -halfH && local.y <= halfH; 
    }

    

    getBounds(): Bounds {
        const corners = this.getLocalCorners();
        const worldCorners = corners.map(p => this.transformPointToDevice(p.x, p.y));
        return boundsFromPoints(worldCorners);
    }

    getLocalBounds(): Bounds {
        const halfW = this.w / 2;
        const halfH = this.h / 2;
        return { minX: -halfW, minY: -halfH, maxX: halfW, maxY: halfH };
    }

    toJSON() {
        return {
            type: 'rect',
            id: this.id,
            w: this.w,
            h: this.h,
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

    clone(): Rect {
        const rect = new Rect(this.w, this.h, this.id);
        rect.transform.copyFrom(this.transform);
        rect.fillStyle = this.fillStyle;
        rect.fillOpacity = this.fillOpacity;
        rect.strokeStyle = this.strokeStyle;
        rect.strokeWidth = this.strokeWidth;
        rect.strokeOpacity = this.strokeOpacity;
        return rect;
    }
}