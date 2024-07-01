import { assets } from '../assets';
import {
    ResourcesPixiConfig,
    SceneManager,
    BaseGame,
    Context,
} from '../framework';

import {
    rootLayoutSection as mainLayout,
    createMainStore,
    MainScene,
    MainState,
    MainUI,
} from './scenes/main';

import {
    rootLayoutSection as resultLayout,
    createResultStore,
    ResultScene,
    GameResult,
    ResultUI,
} from './scenes/result';

export class Game extends BaseGame {
    constructor(assets: ResourcesPixiConfig) {
        super(new SceneManager(), assets);

        const mainStore = createMainStore();
        const mainUI = new MainUI(mainStore, mainLayout);
        const mainScene = new MainScene('main', mainUI, mainStore);

        const resultStore = createResultStore();
        const resultUI = new ResultUI(resultStore, resultLayout);
        const resultScene = new ResultScene('result', resultUI, resultStore);

        this._sceneManager.add(mainScene);
        this._sceneManager.add(resultScene);
        this._sceneManager.setActive('main');

        mainScene.onFinish = this._handleMainSceneFinish;
    }

    async init(): Promise<void> {
        const { resources, pixi } = Context.get();

        await resources.load(assets);
        await this._sceneManager.init();

        pixi.ticker.add(this._sceneManager.update);
    }

    private _handleMainSceneFinish = (state: MainState) => {
        const resultScene = this._sceneManager.get('result');

        let gameResult = GameResult.NONE;
        if (state.scores < state.maxScores) {
            gameResult = GameResult.LOSE;
        } else {
            gameResult = GameResult.WIN;
        }

        resultScene.store.setState({
            result: gameResult,
        });

        this._sceneManager.setActive('result');
    };

    exit(): void {}
}
