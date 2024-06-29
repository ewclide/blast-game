import { Circle, Point } from 'pixi.js';
import { clamp } from './utils';

export class Box {
    readonly min: Point = new Point();
    readonly max: Point = new Point();

    get extents(): number[] {
        const { min, max } = this;
        const w = Math.abs(max.x - min.x) / 2;
        const h = Math.abs(max.y - min.y) / 2;

        return [min.x + w, min.y + h, w, h];
    }

    containPoint(point: Point): boolean {
        const { min, max } = this;
        const { x, y } = point;
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }

    setPositionSize(x: number, y: number, width: number, height: number) {
        this.min.x = x;
        this.min.y = y;
        this.max.x = x + width;
        this.max.y = y + height;
    }
}

export function vectorLength(vector: Point): number {
    const { x, y } = vector;
    return Math.sqrt(x * x + y * y);
}

export function testCircleBox(circle: Circle, aabb: Box): boolean {
    const center = new Point(circle.x, circle.y);
    const [bx, by, boxHalfWidth, boxHalfHeight] = aabb.extents;
    const difference = new Point(center.x - bx, center.y - by);
    const clamped = new Point(
        clamp(difference.x, -boxHalfWidth, boxHalfWidth),
        clamp(difference.y, -boxHalfHeight, boxHalfHeight)
    );
    const closest = new Point(bx + clamped.x, by + clamped.y);

    difference.x = closest.x - center.x;
    difference.y = closest.y - center.y;

    return vectorLength(difference) < circle.radius;
}
