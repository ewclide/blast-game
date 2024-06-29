import { Application } from 'pixi.js';
import { Game } from './game';
import { UI } from './ui';

export class App {
    private _game!: Game;

    constructor(public container: HTMLElement) {}

    async init() {
        const pixi = new Application();
        await pixi.init({
            background: 0x141414,
            resizeTo: window,
        });

        this.container.appendChild(pixi.canvas);

        const game = new Game(pixi, {
            grid: {
                width: 550,
                height: 550,
                sizeX: 10,
                sizeY: 10,
                minBatchSize: 2,
            },
            assets: {
                'tile-blue': 'images/tile-blue.png',
                'tile-red': 'images/tile-red.png',
                'tile-pink': 'images/tile-pink.png',
                'tile-yellow': 'images/tile-yellow.png',
                'tile-green': 'images/tile-green.png',
                'grid-back': 'images/grid-back.png',
                'scores-back': 'images/scores-back.png',
                'booster-back': 'images/booster-back.png',
                'progress-back': 'images/progress-back.png',
                'progress-fill': 'images/progress-fill.png',
                'progress-bg': 'images/progress-bg.png',
                'pause-button': 'images/pause-button.png',
                'pink-button': 'images/pink-button.png',
                'red-button': 'images/red-button.png',
            },
            tileTypes: {
                red: 'tile-red',
                green: 'tile-green',
                blue: 'tile-blue',
                pink: 'tile-pink',
                yellow: 'tile-yellow',
            },
        });

        this._game = game;
        this._game.start();

        pixi.ticker.add(game.update);

        console.log(this);
    }
}
