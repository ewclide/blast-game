import { Container } from 'pixi.js';
import { IStore, StoreState } from '@blast-game/core';
import { IUserInterface } from './ui';
import { TimeSystem } from './time';

export type SceneFinish<S extends StoreState> = (
    state: S,
    scene: IScene<S>
) => void;

export interface IScene<S extends StoreState = any> {
    readonly name: string;
    readonly store: IStore<S>;
    readonly ui: IUserInterface<S>;
    readonly container: Container;
    readonly time: TimeSystem;
    onFinish: SceneFinish<S>;

    init(): Promise<void>;
    finish(): void;
    start(): void;
    stop(): void;
    destroy(): void;
    update(): void;
}

export class BaseScene<S extends StoreState> implements IScene<S> {
    readonly name: string;
    readonly store: IStore<S>;
    readonly ui: IUserInterface<S>;
    readonly container: Container = new Container();
    readonly time: TimeSystem = new TimeSystem();
    private _stop: boolean = true;

    onFinish: SceneFinish<S> = () => {};

    constructor(name: string, ui: IUserInterface<S>, store: IStore<S>) {
        this.name = name;
        this.store = store;
        this.ui = ui;

        this.container.addChild(this.ui.container);
    }

    async init() {
        await this.ui.init();
    }

    update() {
        if (!this._stop) {
            this.time.update();
            this.updateSceneCycle();
        }
    }

    updateSceneCycle() {}

    finish() {
        this.onFinish(this.store.state, this);
    }

    start() {
        this._stop = false;
        this.container.interactive = true;
    }

    stop() {
        this._stop = true;
        this.container.interactive = false;
    }

    destroy() {}
}
