import { LayoutContentData, LayoutSection } from './layout-description';
import { ILayoutParser, LayoutRect } from './layout-parser';
import { ResourceManager } from '../resources';

export function layoutDefaultFitStrategy(
    rect: LayoutRect,
    wrapper: LayoutContainerWrapper
) {
    const container = wrapper.view;
    container.width = rect.width;
    container.height = rect.height;
    container.x = rect.x;
    container.y = rect.y;
}

export interface LayoutContainer {
    width: number;
    height: number;
    x: number;
    y: number;
    addChild(container: LayoutContainer): void;
}

export interface LayoutContainerWrapper<
    C extends LayoutContainer = LayoutContainer
> {
    view: C;
}

export type LayoutSectionID = string;

export type LayoutCreateContainer<T extends LayoutContentData = any> = (
    descriptor: T
) => LayoutContainerWrapper;

export type LayoutFitStrategy = (
    rect: LayoutRect,
    wrapper: LayoutContainerWrapper
) => void;

interface LayoutContainerMethods {
    create: LayoutCreateContainer;
    fit: LayoutFitStrategy;
}

interface FittableContainer<C extends LayoutContainer> {
    sectionID: LayoutSectionID;
    wrapper: LayoutContainerWrapper<C>;
    fit: LayoutFitStrategy;
}

export interface ILayout<C extends LayoutContainer> {
    prepare(resources: ResourceManager): void;
    init(): void;
    update(): void;
    regContentCreator<T extends LayoutContentData>(
        type: string,
        create: LayoutCreateContainer<T>,
        fit: LayoutFitStrategy
    ): void;
    getContainer(id: string): LayoutContainerWrapper<C>;
    attach(
        sectionID: string,
        wrapper: LayoutContainerWrapper<C>,
        fit: LayoutFitStrategy
    ): void;
}

let containerId = 0;
export class Layout<C extends LayoutContainer> implements ILayout<C> {
    private _canvas: HTMLCanvasElement;
    private _rects: Map<string, LayoutRect> = new Map();
    private _section: LayoutSection;
    private _parser: ILayoutParser;
    private _fittables: Map<LayoutSectionID, FittableContainer<C>> = new Map();
    private _containerMethods: Map<string, LayoutContainerMethods> = new Map();
    private _rootContainer: C;

    constructor(
        canvas: HTMLCanvasElement,
        container: C,
        section: LayoutSection,
        parser: ILayoutParser
    ) {
        this._canvas = canvas;
        this._section = section;
        this._parser = parser;
        this._rootContainer = container;
    }

    prepare(resources: ResourceManager) {
        // Implement
    }

    init() {
        this._createContainers(this._section);
        this.update();
    }

    regContentCreator<T extends LayoutContentData>(
        type: string,
        create: LayoutCreateContainer<T>,
        fit: LayoutFitStrategy = layoutDefaultFitStrategy
    ) {
        if (this._containerMethods.has(type)) {
            throw new Error();
        }

        this._containerMethods.set(type, { create, fit });
    }

    getContainer(id: string): LayoutContainerWrapper<C> {
        const fittable = this._fittables.get(id);
        if (fittable === undefined) {
            throw new Error(`Unknown layout id ${id}`);
        }
        return fittable.wrapper;
    }

    attach(
        sectionID: string,
        wrapper: LayoutContainerWrapper<C>,
        fit: LayoutFitStrategy = layoutDefaultFitStrategy
    ) {
        if (this._fittables.has(sectionID)) {
            throw new Error();
        }

        const fittable = { sectionID, wrapper, fit };
        this._fittables.set(sectionID, fittable);
        this._rootContainer.addChild(wrapper.view);
        this._applyFittable(fittable);
    }

    update() {
        this._parser.calc(this._canvas, this._section, this._rects);

        for (const fittable of this._fittables.values()) {
            this._applyFittable(fittable);
        }
    }

    private _applyFittable(fittable: FittableContainer<C>) {
        const rect = this._rects.get(fittable.sectionID);
        if (rect === undefined) {
            return;
        }

        fittable.fit(rect, fittable.wrapper);
    }

    private _createContainers = (section: LayoutSection) => {
        const { content, sections, block } = section;

        if (content) {
            const methods = this._containerMethods.get(content.type);
            if (!methods) {
                throw new Error();
            }

            const id = section.id || `__${content.type}:${containerId++}`;
            section.id = id;

            const container = methods.create(content);
            this.attach(
                id,
                container as LayoutContainerWrapper<C>,
                methods.fit
            );
        }

        if (block) {
            this._createContainers(block);
        } else if (sections) {
            sections.forEach((s) => this._createContainers(s));
        }
    };
}
