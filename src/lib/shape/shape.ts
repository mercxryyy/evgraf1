import { Transform } from './transform';
import { type Bounds } from './bounds';
import type { RasterRenderer, RGBA } from '../raster/RasterRenderer';
import type { Mat3 } from '../math/mat3';
import { mat3 } from '../math/mat3';

export abstract class Shape{
    id: string;
    transform: Transform;
    fillStyle: string = '#000000';
    fillOpacity: number = 1;
    strokeStyle: string = '#000000';
    strokeWidth: number = 1;
    strokeOpacity: number = 1;

    constructor(id?: string) {
        this.id = id || crypto.randomUUID?.() || Math.random().toString(36).slice(2);
        this.transform = new Transform();
    }

    abstract drawRaster(r: RasterRenderer): void;
    abstract hitTest(px: number, py: number): boolean;
    abstract getBounds(): Bounds;
    abstract getLocalBounds(): Bounds;
    abstract toJSON(): any;
    abstract clone(): Shape;

    getLocalToDeviceMatrix(): Mat3 {
        return this.transform.toMatrix();
    }

    getDeviceToLocalMatrix(): Mat3 | null {
        return this.transform.toInverseMatrix();
    }

    transformPointToDevice(px: number, py: number): { x: number; y: number } {
        const m = this.getLocalToDeviceMatrix();
        return mat3.transformPoint(m, px, py);
    }

    transformPointToLocal(px: number, py: number): { x: number; y: number } {
        const inv = this.getDeviceToLocalMatrix();
        if (!inv) return { x: px, y: py };
        return mat3.transformPoint(inv, px, py);
    }

    getCenter(): { x: number; y: number } {
        const b = this.getBounds();
        return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
    }

    setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
        this.resizeFromDeviceAABB(minX, minY, maxX, maxY);
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

    protected hexToRGBA(hex: string, alpha: number): RGBA {
        let h = hex.replace('#', '');
        if (h.length === 3) {
            h = h.split('').map(c => c + c).join('');
        }
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return { r, g, b, a: Math.min(255, Math.max(0, alpha)) };
    }
}