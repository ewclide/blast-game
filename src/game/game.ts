import { Game } from '../framework';
import { MainScene } from './scenes/main';
import { assets } from './assets';

export class BlastGame extends Game {
    constructor() {
        super();

        const mainScene = new MainScene('main');
        this.addScene(mainScene);
        this.setActiveScene('main');
        this.setAssets(assets);
    }
}
