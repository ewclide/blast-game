import { LayoutParserHTML, LayoutSection, StoreState, IStore } from '../core';
import { LayoutPixi } from './pixi';
import { Container } from 'pixi.js';
import { Context } from './context';

export interface IUserInterface<S extends StoreState> {
    readonly container: Container;
    readonly layout: LayoutPixi;
    readonly store: IStore<S>;

    destructor(): void;
    init(): Promise<void>;
}

export class BaseUI<S extends StoreState> implements IUserInterface<S> {
    readonly container: Container;
    readonly layout: LayoutPixi;
    readonly store: IStore<S>;

    constructor(store: IStore<S>, section: LayoutSection) {
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

        this.layout.prepare(resources);

        window.addEventListener('resize', this._handleOnResize);
    }

    destructor() {
        window.removeEventListener('resize', this._handleOnResize);
    }

    async init() {
        this.layout.init();
    }

    private _handleOnResize = () => {
        this.layout.update();
    };
}
