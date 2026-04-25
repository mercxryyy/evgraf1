import { describe, it, expect } from 'vitest';
import { Transform, Rect, Line, Oval, boundsFromPoints } from './index';
import { mat3 } from '../math/mat3';

// ----------------------------------------------------------------------
// Transform
// ----------------------------------------------------------------------
describe('Transform', () => {
    it('creates identity matrix', () => {
        const t = new Transform();
        const m = t.toMatrix();
        expect(m).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

    it('translates correctly', () => {
        const t = new Transform(100, 50);
        const m = t.toMatrix();
        const p = mat3.transformPoint(m, 10, 20);
        expect(p.x).toBe(110);
        expect(p.y).toBe(70);
    });

    it('rotates and scales', () => {
        const t = new Transform(0, 0, Math.PI / 2, 2, 1);
        const m = t.toMatrix();
        const p = mat3.transformPoint(m, 1, 0);
        expect(p.x).toBeCloseTo(0);
        expect(p.y).toBeCloseTo(2);
    });

    it('inverse matrix restores original point', () => {
        const t = new Transform(100, 200, 0.5, 2, 3);
        const inv = t.toInverseMatrix();
        expect(inv).not.toBeNull();
        if (inv) {
            const p = { x: 50, y: 60 };
            const device = mat3.transformPoint(t.toMatrix(), p.x, p.y);
            const local = mat3.transformPoint(inv, device.x, device.y);
            expect(local.x).toBeCloseTo(p.x);
            expect(local.y).toBeCloseTo(p.y);
        }
    });

    it('clones correctly', () => {
        const t = new Transform(10, 20, 0.3, 1.5, 0.8);
        const clone = t.clone();
        expect(clone).not.toBe(t);
        expect(clone.x).toBe(10);
        expect(clone.y).toBe(20);
        expect(clone.rotation).toBe(0.3);
        expect(clone.scaleX).toBe(1.5);
        expect(clone.scaleY).toBe(0.8);
    });
});

// ----------------------------------------------------------------------
// Rect
// ----------------------------------------------------------------------
describe('Rect', () => {
    it('hitTest inside rectangle', () => {
        const rect = new Rect(100, 60);
        rect.transform.x = 200;
        rect.transform.y = 150;
        expect(rect.hitTest(200, 150)).toBe(true);
        expect(rect.hitTest(220, 140)).toBe(true);
        expect(rect.hitTest(170, 130)).toBe(true);
    });

    it('hitTest outside rectangle', () => {
        const rect = new Rect(100, 60);
        rect.transform.x = 200;
        rect.transform.y = 150;
        // точка слева от прямоугольника
        expect(rect.hitTest(140, 150)).toBe(false);
        // точка снизу
        expect(rect.hitTest(200, 190)).toBe(false);
        // точка справа
        expect(rect.hitTest(260, 150)).toBe(false);
    });

    it('hitTest after rotation', () => {
        const rect = new Rect(100, 60);
        rect.transform.x = 300;
        rect.transform.y = 250;
        rect.transform.rotation = Math.PI / 4;
        const localInside = { x: 30, y: 20 };
        const device = rect.transformPointToDevice(localInside.x, localInside.y);
        expect(rect.hitTest(device.x, device.y)).toBe(true);
    });

    it('getLocalBounds returns half extents', () => {
        const rect = new Rect(100, 60);
        const b = rect.getLocalBounds();
        expect(b.minX).toBe(-50);
        expect(b.maxX).toBe(50);
        expect(b.minY).toBe(-30);
        expect(b.maxY).toBe(30);
    });

    it('getBounds after transformation', () => {
        const rect = new Rect(100, 60);
        rect.transform.x = 100;
        rect.transform.y = 100;
        const bounds = rect.getBounds();
        expect(bounds.minX).toBe(50);
        expect(bounds.maxX).toBe(150);
        expect(bounds.minY).toBe(70);
        expect(bounds.maxY).toBe(130);
    });

    it('toJSON serializes correctly', () => {
        const rect = new Rect(40, 30, 'test-id');
        rect.fillStyle = '#FF00FF';
        rect.fillOpacity = 0.5;
        const json = rect.toJSON();
        expect(json.type).toBe('rect');
        expect(json.id).toBe('test-id');
        expect(json.w).toBe(40);
        expect(json.h).toBe(30);
        expect(json.fillStyle).toBe('#FF00FF');
        expect(json.fillOpacity).toBe(0.5);
    });

    it('clone creates independent copy', () => {
        const rect = new Rect(80, 50);
        rect.transform.x = 10;
        const clone = rect.clone();
        clone.transform.x = 20;
        expect(rect.transform.x).toBe(10);
        expect(clone.transform.x).toBe(20);
        expect(clone.w).toBe(80);
    });
});

// ----------------------------------------------------------------------
// Line
// ----------------------------------------------------------------------
describe('Line', () => {
    it('hitTest near the line', () => {
        const line = new Line(0, 0, 100, 0);
        line.strokeWidth = 10;
        // точка на расстоянии 3 пикселя от линии – должна попадать
        expect(line.hitTest(50, 3)).toBe(true);
        // порог = strokeWidth/2 + 5 = 5 + 5 = 10, значит расстояние 6 тоже должно попадать
        expect(line.hitTest(50, 6)).toBe(true);
        // расстояние 12 – уже за порогом
        expect(line.hitTest(50, 12)).toBe(false);
    });

    it('hitTest near diagonal line', () => {
        const line = new Line(0, 0, 100, 100);
        line.strokeWidth = 8;
        expect(line.hitTest(50, 50)).toBe(true);
        // смещение на 4 пикселя перпендикулярно – должно попадать (порог 4+5=9)
        expect(line.hitTest(52, 48)).toBe(true);
        expect(line.hitTest(60, 40)).toBe(false);
    });

    it('getLocalBounds returns min/max of endpoints', () => {
        const line = new Line(-20, 10, 30, -40);
        const b = line.getLocalBounds();
        expect(b.minX).toBe(-20);
        expect(b.maxX).toBe(30);
        expect(b.minY).toBe(-40);
        expect(b.maxY).toBe(10);
    });

    it('getBounds after transformation', () => {
        const line = new Line(0, 0, 100, 0);
        line.transform.x = 50;
        line.transform.y = 50;
        line.transform.rotation = Math.PI / 2;
        const bounds = line.getBounds();
        expect(bounds.minX).toBeCloseTo(50);
        expect(bounds.maxX).toBeCloseTo(50);
        expect(bounds.minY).toBeCloseTo(50);
        expect(bounds.maxY).toBeCloseTo(150);
    });

    it('toJSON serializes', () => {
        const line = new Line(10, 20, 30, 40, 'line1');
        line.strokeWidth = 5;
        const json = line.toJSON();
        expect(json.type).toBe('line');
        expect(json.x1).toBe(10);
        expect(json.y1).toBe(20);
        expect(json.x2).toBe(30);
        expect(json.y2).toBe(40);
        expect(json.strokeWidth).toBe(5);
    });
});

// ----------------------------------------------------------------------
// Oval
// ----------------------------------------------------------------------
describe('Oval', () => {
    it('hitTest inside ellipse', () => {
        const oval = new Oval(100, 60);
        oval.transform.x = 0;
        oval.transform.y = 0;
        expect(oval.hitTest(50, 30)).toBe(true);   // на границе
        expect(oval.hitTest(0, 0)).toBe(true);     // центр
        expect(oval.hitTest(70, 20)).toBe(true);   // внутри
    });

    it('hitTest outside ellipse', () => {
        const oval = new Oval(100, 60);
        // точка на границе по X (100,0) – должна считаться внутри (уравнение <=1)
        expect(oval.hitTest(100, 0)).toBe(true);
        expect(oval.hitTest(0, 60)).toBe(true);
        // точки за границами
        expect(oval.hitTest(101, 0)).toBe(false);
        expect(oval.hitTest(0, 61)).toBe(false);
        expect(oval.hitTest(80, 40)).toBe(false);
    });

    it('hitTest after rotation and translation', () => {
        const oval = new Oval(80, 50);
        oval.transform.x = 200;
        oval.transform.y = 150;
        oval.transform.rotation = Math.PI / 3;
        const local = { x: 40, y: 25 };
        const device = oval.transformPointToDevice(local.x, local.y);
        expect(oval.hitTest(device.x, device.y)).toBe(true);
    });

    it('getLocalBounds returns rx, ry', () => {
        const oval = new Oval(70, 40);
        const b = oval.getLocalBounds();
        expect(b.minX).toBe(-70);
        expect(b.maxX).toBe(70);
        expect(b.minY).toBe(-40);
        expect(b.maxY).toBe(40);
    });

    it('getBounds after scaling', () => {
        const oval = new Oval(50, 30);
        oval.transform.scaleX = 2;
        oval.transform.scaleY = 1.5;
        const bounds = oval.getBounds();
        expect(bounds.minX).toBe(-100);
        expect(bounds.maxX).toBe(100);
        expect(bounds.minY).toBe(-45);
        expect(bounds.maxY).toBe(45);
    });

    it('toJSON serializes', () => {
        const oval = new Oval(25, 15, 'oval1');
        oval.fillStyle = '#00FF00';
        const json = oval.toJSON();
        expect(json.type).toBe('oval');
        expect(json.rx).toBe(25);
        expect(json.ry).toBe(15);
        expect(json.fillStyle).toBe('#00FF00');
    });
});

// ----------------------------------------------------------------------
// Bounds utilities
// ----------------------------------------------------------------------
describe('boundsFromPoints', () => {
    it('computes correct bounds from points', () => {
        const points = [
            { x: 10, y: 20 },
            { x: 100, y: 5 },
            { x: 50, y: 200 },
        ];
        const b = boundsFromPoints(points);
        expect(b.minX).toBe(10);
        expect(b.maxX).toBe(100);
        expect(b.minY).toBe(5);
        expect(b.maxY).toBe(200);
    });
});

describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})

describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})

describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})
describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})

describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})
describe('SUPER TEST', () => {
    it('adwwad', () => {
        expect(0).toBe(0)
    }) 
})