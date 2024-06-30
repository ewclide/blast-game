import { Context } from './context';
import { ResourcesPixiConfig } from './pixi';
import { Scene } from './scene';

export class Game {
    private _scenes: Map<string, Scene> = new Map();
    private _activeScene: Scene | null = null;
    private _assets: ResourcesPixiConfig = {};

    setAssets(assets: ResourcesPixiConfig) {
        this._assets = assets;
    }

    async init(): Promise<void> {
        const { resources } = Context.get();
        await resources.load(this._assets);
        console.log('after resouces load');

        for (const scene of this._scenes.values()) {
            await scene.init();
        }

        console.log(resources);

        this.getActiveScene().start();
    }

    addScene(scene: Scene) {
        this._scenes.set(scene.name, scene);
    }

    getScene(name: string): Scene {
        const scene = this._scenes.get(name);
        if (scene === undefined) {
            throw new Error();
        }

        return scene;
    }

    setActiveScene(name: string) {
        const scene = this.getScene(name);
        this._activeScene = scene;
    }

    getActiveScene(): Scene {
        const scene = this._activeScene;
        if (scene === null) {
            throw new Error();
        }
        return scene;
    }

    update = () => {
        this.updateCrossSceneLogic();
        if (this._activeScene) {
            this._activeScene.update();
        }
    };

    updateCrossSceneLogic() {}
}
