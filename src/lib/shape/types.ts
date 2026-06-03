import type { RGBA } from '../raster/RasterRenderer';

/** Трансформация фигуры (положение, поворот, масштаб) */
export interface Transform {
    x: number;          // смещение по X
    y: number;          // смещение по Y
    rotation: number;   // угол в радианах
    scaleX: number;     // масштаб по X
    scaleY: number;     // масштаб по Y
}

/** Ограничивающий прямоугольник (bounds) */
export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/** Точка в 2D пространстве */
export interface Point {
    x: number;
    y: number;
}

/** Интерфейс растеризатора (для ослабления связи между фигурами и рендерером) */
export interface IRenderer {
    width: number;
    height: number;
    fillPolygon(points: Point[], color: RGBA): void;
    strokePolygon(points: Point[], color: RGBA, width: number, closed?: boolean): void;
    strokeLine(x0: number, y0: number, x1: number, y1: number, color: RGBA, width: number): void;
    fillCircle(cx: number, cy: number, radius: number, color: RGBA): void;
    setLineAlgorithm(alg: 'bresenham' | 'wu'): void;
}