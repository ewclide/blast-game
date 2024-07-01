import { Context } from './context';
import { IScene } from './scene';

export interface ISceneManager {
    get activeScene(): IScene;

    init(): Promise<void>;
    add(scene: IScene): void;
    get(name: string): IScene;
    setActive(name: string): void;
    update(): void;
}

export class SceneManager implements ISceneManager {
    private _scenes: Map<string, IScene> = new Map();
    private _activeScene: IScene | null = null;

    get activeScene(): IScene {
        const scene = this._activeScene;
        if (scene === null) {
            throw new Error();
        }
        return scene;
    }

    async init(): Promise<void> {
        for (const scene of this._scenes.values()) {
            await scene.init();
        }

        this.activeScene.start();
    }

    add(scene: IScene) {
        this._scenes.set(scene.name, scene);
    }

    get(name: string): IScene {
        const scene = this._scenes.get(name);
        if (scene === undefined) {
            throw new Error();
        }

        return scene;
    }

    setActive(name: string) {
        const { stage } = Context.get().pixi;
        const scene = this.get(name);

        let prevScene = this._activeScene;
        if (prevScene !== null) {
            stage.removeChild(prevScene.container);
        }

        stage.addChild(scene.container);
        this._activeScene = scene;
    }

    update = () => {
        if (this._activeScene) {
            this._activeScene.update();
        }
    };
}
