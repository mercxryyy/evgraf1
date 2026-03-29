import { test, expect } from "vitest";
import { mat3, type Mat3 } from "./mat3";

function expectMatCloseTo(actual: Mat3, expected: Mat3, eps = 1e-9) {
    for (let i = 0; i < 9; i++) {
        expect(actual[i]).toBeCloseTo(expected[i]);
    }
}

test("identity", () => {
    const I = mat3.identity();
    expect(I).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
});

test("translate", () => {
    const T = mat3.translate(10, -5);
    expect(T).toEqual([1, 0, 10, 0, 1, -5, 0, 0, 1]);
    
    const p = mat3.transformPoint(T, 3, 4);
    expect(p.x).toBe(13);
    expect(p.y).toBe(-1);
});

test("scale", () => {
    const S = mat3.scale(2, 0.5);
    expect(S).toEqual([2, 0, 0, 0, 0.5, 0, 0, 0, 1]);
    
    const p = mat3.transformPoint(S, 4, 6);
    expect(p.x).toBe(8);
    expect(p.y).toBe(3);
});

test("rotate 90°", () => {
    const R = mat3.rotate(Math.PI / 2);
    const p = mat3.transformPoint(R, 1, 0);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
});

test("invert translation", () => {
    const T = mat3.translate(10, 20);
    const T_inv = mat3.invert(T);
    expect(T_inv).not.toBeNull();
    
    if (T_inv) {
        const I = mat3.multiply(T, T_inv);
        expect(I[0]).toBeCloseTo(1);
        expect(I[4]).toBeCloseTo(1);
    }
});

test("fromTransform", () => {
    const M = mat3.fromTransform(100, 50, Math.PI / 4, 2, 1);
    const p = mat3.transformPoint(M, 1, 0);
    
    const afterScale = { x: 2, y: 0 };
    const afterRotate = {
        x: afterScale.x * Math.cos(Math.PI/4) - afterScale.y * Math.sin(Math.PI/4),
        y: afterScale.x * Math.sin(Math.PI/4) + afterScale.y * Math.cos(Math.PI/4)
    };
    const expected = { x: afterRotate.x + 100, y: afterRotate.y + 50 };
    
    expect(p.x).toBeCloseTo(expected.x);
    expect(p.y).toBeCloseTo(expected.y);
});