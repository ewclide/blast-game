import { Application, Container, Text } from 'pixi.js';

export type LayoutAlign = 'start' | 'center' | 'end';

export type LayoutDirection = 'vertical' | 'horizontal';

export type LayoutContentDescriptor = Record<string, unknown>;

export type LayoutContentBuilder<T extends LayoutContentDescriptor = any> = (
    descriptor: T
) => Container;

export interface LayoutContent extends LayoutContentDescriptor {
    type: string;
}

export interface LayoutSection {
    key?: string;
    width?: string;
    height?: string;
    direction?: LayoutDirection;
    sections?: LayoutSection[];
    block?: LayoutBlock;
    content?: LayoutContent;
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
    private _section: LayoutSection;
    private _calculator: ILayoutCalculator;
    private _containers: Map<string, Container> = new Map();
    private _contentBuilders: Map<string, LayoutContentBuilder> = new Map();

    constructor(pixi: Application, root: LayoutSection) {
        this._pixi = pixi;
        this._section = root;
        this._calculator = new LayoutCalculator();
        this._calculator.calc(pixi.canvas, root, this._rects);
        console.log(this);
    }

    create(root: Container) {
        this._createContainers(root, this._section);
        this.update();
        console.log(this);
    }

    regContentBuilder<T extends LayoutContentDescriptor>(
        type: string,
        builder: LayoutContentBuilder<T>
    ) {
        if (this._contentBuilders.has(type)) {
            throw new Error();
        }

        this._contentBuilders.set(type, builder);
    }

    getRect(key: string): LayoutRect {
        const rect = this._rects.get(key);
        if (rect === undefined) {
            throw new Error(`Unknown layout key ${key}`);
        }
        return rect;
    }

    attach(key: string, container: Container) {
        if (this._containers.has(key)) {
            throw new Error();
        }

        this._containers.set(key, container);
    }

    update() {
        this._calculator.calc(this._pixi.canvas, this._section, this._rects);

        for (const [key, container] of this._containers) {
            const rect = this.getRect(key);
            // console.log(rect, container);
            if (!(container instanceof Text)) {
                container.width = rect.width;
                container.height = rect.height;
            }
            container.x = rect.x;
            container.y = rect.y;
        }
    }

    private _createContainers = (root: Container, section: LayoutSection) => {
        const { content, sections, block } = section;

        if (content) {
            const builder = this._contentBuilders.get(content.type);
            if (!builder) {
                throw new Error();
            }

            const key = section.key || `__${content.type}:${containerId++}`;
            section.key = key;

            const container = builder(content);
            root.addChild(container);
            this.attach(key, container);
        }

        if (block) {
            this._createContainers(root, block);
        } else if (sections) {
            sections.forEach((s) => this._createContainers(root, s));
        }
    };
}

interface ILayoutCalculator {
    calc(
        canvas: HTMLCanvasElement,
        root: LayoutSection,
        rects: Map<string, LayoutRect>
    ): void;
}

let containerId = 0;
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
        const { sections, block } = props;

        const div = this._createElement(props);

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
            alighX = 'center',
            alignY = 'center',
            offsetX,
            offsetY,
            sections,
            block,
        } = props;

        const div = this._createElement(props);

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

        Object.assign(div.style, margin);

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

    private _createElement(props: LayoutSection): HTMLDivElement {
        const {
            key,
            width = '100%',
            height = '100%',
            direction = 'horizontal',
        } = props;

        const div = document.createElement('div');
        Object.assign(div.style, {
            width,
            height,
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            border: '1px dashed red',
            boxSizing: 'border-box',
            zIndex: 1000,
        });

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
