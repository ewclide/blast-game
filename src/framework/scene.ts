import { Container } from 'pixi.js';
import { Store } from '../core';
import { TimeSystem } from './time';
import { UI } from './ui';
import { Context } from './context';

export abstract class Scene<S extends Store = Store> {
    abstract readonly store: S;
    abstract readonly ui: UI<S>;
    readonly container: Container = new Container();
    readonly time: TimeSystem = new TimeSystem();
    private _stop: boolean = true;

    constructor(public name: string) {
        const { stage } = Context.get().pixi;
        stage.addChild(this.container);
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

    start() {
        this._stop = false;
    }

    stop() {
        this._stop = true;
    }

    destroy() {}
}
