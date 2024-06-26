import { Point } from 'pixi.js';

export interface ClickData {
    relative: Point;
    absolute: Point;
}

export class InputSystem {
    private _click: ClickData | null = null;

    get click(): ClickData | null {
        return this._click;
    }

    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('click', this._handleClick);
    }

    private _handleClick = (event: MouseEvent) => {
        this._click = {
            absolute: new Point(event.clientX, event.clientY),
            relative: new Point(event.offsetX, event.offsetY),
        };
    };

    lateUpdate() {
        this._click = null;
    }
}
