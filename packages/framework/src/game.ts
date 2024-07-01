import { ResourcesPixiConfig } from '@blast-game/pixi';
import { ISceneManager } from './scene-manager';
import { Context } from './context';

export interface IGame {
    init(): Promise<void>;
    exit(): void;
}

export class BaseGame implements IGame {
    protected _sceneManager: ISceneManager;
    protected _assets: ResourcesPixiConfig;

    constructor(sceneManager: ISceneManager, assets: ResourcesPixiConfig) {
        this._sceneManager = sceneManager;
        this._assets = assets;
    }

    async init(): Promise<void> {
        const { resources, pixi } = Context.get();
        await resources.load(this._assets);

        pixi.ticker.add(this._sceneManager.update);
    }

    exit(): void {}
}
