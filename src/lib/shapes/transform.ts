import { mat3, type Mat3 } from '../math/mat3';

export class Transform {
    x: number = 0;
    y: number = 0;
    rotation: number = 0;   
    scaleX: number = 1;
    scaleY: number = 1;

    constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    clone(): Transform {
        return new Transform(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
    }

    toMatrix(): Mat3 {
        return mat3.fromTransform(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
    }

    toInverseMatrix(): Mat3 | null {
        return mat3.invert(this.toMatrix());
    }

    copyFrom(other: Transform): void {
        this.x = other.x;
        this.y = other.y;
        this.rotation = other.rotation;
        this.scaleX = other.scaleX;
        this.scaleY = other.scaleY;
    }
}