import { Application } from 'pixi.js';

export type LayoutAlign = 'start' | 'center' | 'end';
export type LayoutDirection = 'vertical' | 'horizontal';
export interface LayoutSection {
    key?: string;
    width?: string;
    height?: string;
    direction?: LayoutDirection;
    sections?: LayoutSection[];
    block?: LayoutBlock;
}

export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface LayoutBlock extends LayoutSection {
    alighX?: LayoutAlign;
    alignY?: LayoutAlign;
    offsetX?: string;
    offsetY?: string;
}

export class Layout {
    private _pixi: Application;
    private _rects: Map<string, LayoutRect> = new Map();
    private _root: LayoutSection;
    private _calculator: ILayoutCalculator;

    constructor(pixi: Application, root: LayoutSection) {
        this._pixi = pixi;
        this._root = root;
        this._calculator = new LayoutCalculator();
        console.log(this);
    }

    getRect(key: string): LayoutRect {
        const rect = this._rects.get(key);
        if (rect === undefined) {
            throw new Error();
        }
        return rect;
    }

    update() {
        this._calculator.calc(this._pixi.canvas, this._root, this._rects);
    }
}

interface ILayoutCalculator {
    calc(
        canvas: HTMLCanvasElement,
        root: LayoutSection,
        rects: Map<string, LayoutRect>
    ): void;
}

class LayoutCalculator implements ILayoutCalculator {
    private _htmlHelpers: Map<string, HTMLDivElement> = new Map();

    calc(
        canvas: HTMLCanvasElement,
        root: LayoutSection,
        rects: Map<string, LayoutRect>
    ) {
        const rect = canvas.getBoundingClientRect();
        const helpers = this._createSection(root);

        Object.assign(helpers.style, {
            position: 'absolute',
            top: rect.x + 'px',
            left: rect.y + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
        });

        document.body.appendChild(helpers);

        for (const [key, div] of this._htmlHelpers) {
            const { x, y, width, height } = div.getBoundingClientRect();
            rects.set(key, { x, y, width, height });
        }

        document.body.removeChild(helpers);
        this._htmlHelpers.clear();
    }

    private _createSection(props: LayoutSection): HTMLDivElement {
        const {
            key,
            width = '100%',
            height = '100%',
            direction = 'horizontal',
            sections,
            block,
        } = props;

        const div = this._createElement(key);
        Object.assign(div.style, {
            width,
            height,
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            // border: '1px solid red',
            // boxSizing: 'border-box',
            // zIndex: 1000,
        });

        if (block) {
            const subDiv = this._createBlock(div, block);
            div.appendChild(subDiv);
            return div;
        }

        if (sections) {
            for (const section of sections) {
                const subDiv = this._createSection(section);
                div.appendChild(subDiv);
            }
        }

        return div;
    }

    private _createBlock(
        root: HTMLDivElement,
        props: LayoutBlock
    ): HTMLDivElement {
        const {
            key,
            width = '100%',
            height = '100%',
            alighX = 'center',
            alignY = 'center',
            offsetX,
            offsetY,
            sections,
            block,
        } = props;

        const div = this._createElement(key);

        const margin: Record<string, string> = {};
        if (offsetX) {
            if (alighX === 'start') {
                margin.marginLeft = offsetX;
            } else if (alighX === 'end') {
                margin.marginRight = offsetX;
            }
        }
        if (offsetY) {
            if (alignY === 'start') {
                margin.marginTop = offsetY;
            } else if (alignY === 'end') {
                margin.marginBottom = offsetY;
            }
        }

        Object.assign(root.style, {
            justifyContent: alighX,
            alignItems: alignY,
        });

        Object.assign(div.style, {
            width,
            height,
            display: 'flex',
            ...margin,
        });

        if (block) {
            const subDiv = this._createBlock(div, block);
            div.appendChild(subDiv);
            return div;
        }

        if (sections) {
            for (const section of sections) {
                const subDiv = this._createSection(section);
                div.appendChild(subDiv);
            }
        }

        return div;
    }

    private _createElement(key?: string): HTMLDivElement {
        const div = document.createElement('div');
        if (!key) {
            return div;
        }

        if (this._htmlHelpers.has(key)) {
            throw new Error();
        }

        this._htmlHelpers.set(key, div);
        return div;
    }
}
