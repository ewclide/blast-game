import { LayoutSection, LayoutParserHTML, Store } from '../core';
import { LayoutPixi } from './pixi';
import { Container } from 'pixi.js';
import { Context } from './context';

export class UI<S extends Store> {
    readonly container: Container;
    readonly layout: LayoutPixi;
    readonly store: S;

    constructor(store: S, section: LayoutSection) {
        const { pixi, resources } = Context.get();
        const container = new Container();

        this.store = store;
        this.container = container;
        this.layout = new LayoutPixi(
            pixi.canvas,
            container,
            section,
            new LayoutParserHTML()
        );

        // TODO: may be split to layout builder and share it between UI's
        this.layout.prepare(resources);

        window.addEventListener('resize', this._handleOnResize);
    }

    destroy() {
        window.removeEventListener('resize', this._handleOnResize);
        // TODO store destroy
    }

    async init() {
        this.layout.init();
    }

    private _handleOnResize = () => {
        this.layout.update();
    };
}
