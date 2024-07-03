import { ResourceTypes } from '@blast-game/core';
import { ResourcesPixi } from '@blast-game/pixi';
import { Application, Texture } from 'pixi.js';

const resourceTypes: ResourceTypes = {
    fonts: FontFace,
    textures: Texture,
};

let globalContext: Context | null;
export type GameConfig = Record<string, unknown>;

export class Context<C extends GameConfig = GameConfig> {
    readonly pixi: Application;
    readonly container: HTMLElement;
    readonly resources: ResourcesPixi = new ResourcesPixi();
    readonly config: C;

    constructor(container: HTMLElement, config: C) {
        this.pixi = new Application();
        this.container = container;
        this.resources.register(resourceTypes);
        this.config = config;
        this.bind();
    }

    async init() {
        const { pixi } = this;
        await pixi.init({
            // TODO: setup it outside
            background: 0x141414,
            resizeTo: window,
        });

        this.container.appendChild(pixi.canvas);
    }

    bind() {
        globalContext = this;
    }

    static get<C extends GameConfig = GameConfig>(): Context<C> {
        if (globalContext === null) {
            throw new Error();
        }
        return globalContext as Context<C>;
    }
}
