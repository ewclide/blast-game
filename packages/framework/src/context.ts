import { ResourceTypes } from '@blast-game/core';
import { ResourcesPixi } from '@blast-game/pixi';
import { Application, Texture } from 'pixi.js';

const resourceTypes: ResourceTypes = {
    fonts: FontFace,
    textures: Texture,
};

let globalContext: Context | null;

export class Context {
    readonly pixi: Application;
    readonly container: HTMLElement;
    readonly resources: ResourcesPixi = new ResourcesPixi();

    constructor(container: HTMLElement) {
        this.pixi = new Application();
        this.container = container;
        this.resources.register(resourceTypes);
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

    static get(): Context {
        if (globalContext === null) {
            throw new Error();
        }
        return globalContext;
    }
}
